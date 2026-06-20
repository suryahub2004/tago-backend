"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const kafka_producer_1 = require("../../kafka/kafka.producer");
const topics_1 = require("../../kafka/topics");
const uuid_1 = require("uuid");
let ShopService = class ShopService {
    prisma;
    kafkaProducer;
    constructor(prisma, kafkaProducer) {
        this.prisma = prisma;
        this.kafkaProducer = kafkaProducer;
    }
    async getProducts() {
        return this.prisma.product.findMany({
            where: { isActive: true },
        });
    }
    async getProduct(slug) {
        const product = await this.prisma.product.findUnique({ where: { slug } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async createOrder(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product || product.stock < dto.quantity) {
            throw new common_1.BadRequestException('Product out of stock');
        }
        const order = await this.prisma.order.create({
            data: {
                userId: user.id,
                status: 'PENDING',
                totalAmount: product.price * dto.quantity,
                shippingAddress: dto.shippingAddress,
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
        await this.prisma.product.update({
            where: { id: dto.productId },
            data: { stock: { decrement: dto.quantity } },
        });
        await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.ORDER_CREATED, {
            eventId: (0, uuid_1.v4)(),
            occurredAt: new Date().toISOString(),
            version: '1.0',
            orderId: order.id,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPhone: dto.shippingAddress.phone,
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
    async getMyOrders(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOrderById(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: { include: { product: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async getAdminOrders(page, limit, status, search) {
        const where = {};
        if (status)
            where.status = status;
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
    async getAdminOrderDetail(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: { include: { product: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async updateOrderStatus(id, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status: dto.status,
                trackingNumber: dto.trackingNumber !== undefined ? dto.trackingNumber : undefined,
                notes: dto.adminNote !== undefined ? dto.adminNote : undefined,
            },
        });
        await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.ORDER_STATUS_UPDATED, {
            eventId: (0, uuid_1.v4)(),
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
};
exports.ShopService = ShopService;
exports.ShopService = ShopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        kafka_producer_1.KafkaProducer])
], ShopService);
//# sourceMappingURL=shop.service.js.map