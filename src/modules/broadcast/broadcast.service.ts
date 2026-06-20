import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { KAFKA_TOPICS } from '../../kafka/topics';
import { AppGateway } from '../../gateways/app.gateway';
import { v4 as uuid } from 'uuid';

@Injectable()
export class BroadcastService {
  constructor(
    private prisma: PrismaService,
    private kafkaProducer: KafkaProducer,
    private appGateway: AppGateway,
  ) {}

  private async _getTargetUsers(segment: string) {
    if (segment === 'ring_users') {
      return this.prisma.user.findMany({
        where: {
          devices: { some: { deviceType: 'SMART_RING', isActive: true } },
        },
        select: { fcmToken: true },
      });
    }
    if (segment === 'band_users') {
      return this.prisma.user.findMany({
        where: {
          devices: { some: { deviceType: 'WHOOP_BAND', isActive: true } },
        },
        select: { fcmToken: true },
      });
    }
    // 'all'
    return this.prisma.user.findMany({
      where: { isActive: true, fcmToken: { not: null } },
      select: { fcmToken: true },
    });
  }

  async sendPopup(dto: CreateBroadcastDto, adminId: string) {
    // 1. Save to DB
    const message = await this.prisma.broadcastMessage.create({
      data: { ...dto, sentByAdminId: adminId },
    });

    // 2. Get target FCM tokens
    const users = await this._getTargetUsers(dto.targetSegment);
    const fcmTokens = users.map((u) => u.fcmToken).filter(Boolean) as string[];

    // 3. Publish to Kafka — notification.consumer handles FCM dispatch
    await this.kafkaProducer.publish(KAFKA_TOPICS.BROADCAST_POPUP_SEND, {
      eventId: uuid(),
      occurredAt: new Date().toISOString(),
      version: '1.0',
      messageId: message.id,
      title: dto.title,
      body: dto.body,
      type: dto.type,
      isDismissable: dto.isDismissable,
      actionLabel: dto.actionLabel,
      actionUrl: dto.actionUrl,
      imageUrl: dto.imageUrl,
      fcmTokens,
      targetSegment: dto.targetSegment,
    });

    // 4. Emit via AppGateway WebSocket (/app namespace) for foregrounded users
    this.appGateway.emitPopupMessage({
      id: message.id,
      title: dto.title,
      body: dto.body,
      type: dto.type,
      isDismissable: dto.isDismissable,
      actionLabel: dto.actionLabel,
      actionUrl: dto.actionUrl,
      imageUrl: dto.imageUrl,
    });

    // 5. Update recipient count
    await this.prisma.broadcastMessage.update({
      where: { id: message.id },
      data: { recipientCount: fcmTokens.length },
    });

    return message;
  }

  async getMessages(page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.prisma.broadcastMessage.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: { sentByAdmin: { select: { name: true, email: true } } },
      }),
      this.prisma.broadcastMessage.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMessage(id: string) {
    return this.prisma.broadcastMessage.findUnique({
      where: { id },
      include: { sentByAdmin: { select: { name: true, email: true } } },
    });
  }
}
