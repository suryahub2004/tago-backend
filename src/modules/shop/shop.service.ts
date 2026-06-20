import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { KAFKA_TOPICS } from '../../kafka/topics';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ShopService {
  constructor(
    private prisma: PrismaService,
    private kafkaProducer: KafkaProducer,
  ) {}

  async getProducts() {
    return this.prisma.product.findMany({
      where: { isActive: true },
    });
  }

  async getProduct(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    // Fetch user details for the event
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product || product.stock < dto.quantity) {
      throw new BadRequestException('Product out of stock');
    }

    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        totalAmount: product.price * dto.quantity,
        shippingAddress: dto.shippingAddress as any, // stored as JSON
        paymentMethod: dto.paymentMethod,
        paymentId: dto.paymentId,
        ringSize: dto.ringSize,
        notes: dto.notes,
        items: {
          create: [
            {
              productId: dto.productId,
              quantity: dto.quantity,
              unitPrice: product.price,
            },
          ],
        },
      },
      include: { items: { include: { product: true } }, user: true },
    });

    // Deduct stock
    await this.prisma.product.update({
      where: { id: dto.productId },
      data: { stock: { decrement: dto.quantity } },
    });

    // Kafka event — dashboard sees order instantly
    await this.kafkaProducer.publish(KAFKA_TOPICS.ORDER_CREATED, {
      eventId: uuid(),
      occurredAt: new Date().toISOString(),
      version: '1.0',
      orderId: order.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: (dto.shippingAddress as any).phone,
      totalAmount: order.totalAmount,
      paymentMethod: dto.paymentMethod,
      productName: product.name,
      ringSize: dto.ringSize,
      items: [
        { name: product.name, quantity: dto.quantity, price: product.price },
      ],
    });

    return order;
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /// Fetch a single order — only returns it if it belongs to the requesting user.
  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { include: { product: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // Admin Methods
  async getAdminOrders(
    page: number,
    limit: number,
    status?: any,
    search?: string,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.id = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdminOrderDetail(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        trackingNumber:
          dto.trackingNumber !== undefined ? dto.trackingNumber : undefined,
        notes: dto.adminNote !== undefined ? dto.adminNote : undefined,
      },
    });

    await this.kafkaProducer.publish(KAFKA_TOPICS.ORDER_STATUS_UPDATED, {
      eventId: uuid(),
      occurredAt: new Date().toISOString(),
      version: '1.0',
      orderId: updatedOrder.id,
      userId: updatedOrder.userId,
      fcmToken: order.user?.fcmToken,
      previousStatus: order.status,
      newStatus: updatedOrder.status,
      trackingNumber: updatedOrder.trackingNumber,
    });

    return updatedOrder;
  }
}
