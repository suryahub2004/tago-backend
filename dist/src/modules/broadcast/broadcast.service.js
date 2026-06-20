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
exports.BroadcastService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const kafka_producer_1 = require("../../kafka/kafka.producer");
const topics_1 = require("../../kafka/topics");
const app_gateway_1 = require("../../gateways/app.gateway");
const uuid_1 = require("uuid");
let BroadcastService = class BroadcastService {
    prisma;
    kafkaProducer;
    appGateway;
    constructor(prisma, kafkaProducer, appGateway) {
        this.prisma = prisma;
        this.kafkaProducer = kafkaProducer;
        this.appGateway = appGateway;
    }
    async _getTargetUsers(segment) {
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
        return this.prisma.user.findMany({
            where: { isActive: true, fcmToken: { not: null } },
            select: { fcmToken: true },
        });
    }
    async sendPopup(dto, adminId) {
        const message = await this.prisma.broadcastMessage.create({
            data: { ...dto, sentByAdminId: adminId },
        });
        const users = await this._getTargetUsers(dto.targetSegment);
        const fcmTokens = users.map((u) => u.fcmToken).filter(Boolean);
        await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.BROADCAST_POPUP_SEND, {
            eventId: (0, uuid_1.v4)(),
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
        await this.prisma.broadcastMessage.update({
            where: { id: message.id },
            data: { recipientCount: fcmTokens.length },
        });
        return message;
    }
    async getMessages(page, limit) {
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
    async getMessage(id) {
        return this.prisma.broadcastMessage.findUnique({
            where: { id },
            include: { sentByAdmin: { select: { name: true, email: true } } },
        });
    }
};
exports.BroadcastService = BroadcastService;
exports.BroadcastService = BroadcastService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        kafka_producer_1.KafkaProducer,
        app_gateway_1.AppGateway])
], BroadcastService);
//# sourceMappingURL=broadcast.service.js.map