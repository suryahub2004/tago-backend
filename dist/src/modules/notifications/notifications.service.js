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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyNotifications(userId, page, limit, isRead) {
        const where = { userId };
        if (isRead !== undefined)
            where.isRead = isRead;
        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { sentAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async markAsRead(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async createNotification(userId, dto) {
        return this.prisma.notification.create({
            data: {
                userId,
                type: dto.type,
                title: dto.title,
                body: dto.message,
                data: dto.metadata,
            },
        });
    }
    async broadcastNotification(dto) {
        const users = await this.prisma.user.findMany({
            where: { isActive: true },
            select: { id: true },
        });
        await this.prisma.notification.createMany({
            data: users.map((u) => ({
                userId: u.id,
                type: dto.type,
                title: dto.title,
                body: dto.message,
                data: dto.metadata,
            })),
        });
        return { success: true, count: users.length };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map