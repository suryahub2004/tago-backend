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
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let AlertsService = class AlertsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyAlerts(userId, page, limit, severity, isRead) {
        const where = { userId };
        if (severity)
            where.severity = severity;
        if (isRead !== undefined)
            where.isRead = isRead;
        const [data, total] = await Promise.all([
            this.prisma.alert.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.alert.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async markAsRead(userId, alertId) {
        const alert = await this.prisma.alert.findFirst({
            where: { id: alertId, userId },
        });
        if (!alert)
            throw new common_1.NotFoundException('Alert not found');
        return this.prisma.alert.update({
            where: { id: alertId },
            data: { isRead: true },
        });
    }
    async acknowledgeAlert(userId, alertId) {
        const alert = await this.prisma.alert.findFirst({
            where: { id: alertId, userId },
        });
        if (!alert)
            throw new common_1.NotFoundException('Alert not found');
        return this.prisma.alert.update({
            where: { id: alertId },
            data: { isAcknowledged: true, acknowledgedAt: new Date(), isRead: true },
        });
    }
    async getSettings(userId) {
        return { thresholds: { hr_high: 130, hr_low: 40, spo2_low: 95 } };
    }
    async updateSettings(userId, dto) {
        return { thresholds: dto.thresholds };
    }
    async getAdminOverview() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalToday = await this.prisma.alert.count({
            where: { createdAt: { gte: today } },
        });
        const criticalToday = await this.prisma.alert.count({
            where: { severity: 'CRITICAL', createdAt: { gte: today } },
        });
        const acknowledgedCount = await this.prisma.alert.count({
            where: { isAcknowledged: true, createdAt: { gte: today } },
        });
        return {
            totalToday,
            criticalToday,
            acknowledgedRate: totalToday > 0 ? (acknowledgedCount / totalToday) * 100 : 0,
            volumeChart: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50)),
        };
    }
    async getAdminAlerts(page, limit, severity, userId) {
        const where = {};
        if (severity)
            where.severity = severity;
        if (userId)
            where.userId = userId;
        const [data, total] = await Promise.all([
            this.prisma.alert.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.alert.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map