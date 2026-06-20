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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const influxdb_service_1 = require("../influxdb/influxdb.service");
let UsersService = class UsersService {
    prisma;
    redisService;
    influxDB;
    constructor(prisma, redisService, influxDB) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.influxDB = influxDB;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                healthProfile: true,
                devices: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateProfile(userId, dto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: dto,
        });
    }
    async getHealthProfile(userId) {
        const profile = await this.prisma.healthProfile.findUnique({
            where: { userId },
        });
        if (!profile)
            throw new common_1.NotFoundException('Health profile not found');
        return profile;
    }
    async updateHealthProfile(userId, dto) {
        return this.prisma.healthProfile.upsert({
            where: { userId },
            update: dto,
            create: {
                userId,
                ...dto,
            },
        });
    }
    async softDelete(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                email: `deleted_${userId}@anonymized.com`,
                name: 'Deleted User',
            },
        });
    }
    async getAdminUsers(page, limit, role, deviceType, isActive, search) {
        const where = {};
        if (role)
            where.role = role;
        if (isActive !== undefined)
            where.isActive = isActive;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (deviceType) {
            where.devices = { some: { deviceType } };
        }
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getAdminUserDetail(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                healthProfile: true,
                devices: true,
                orders: true,
                _count: {
                    select: { alerts: true },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async toggleUserStatus(id, isActive) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive },
        });
    }
    async hardDelete(id) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
    async updateReadinessScore(userId, score, computedAt) {
        await this.redisService.client.setex(`readiness:${userId}`, 86400, JSON.stringify({ score, computedAt }));
        return { stored: true };
    }
    async getReadinessScore(userId) {
        const raw = await this.redisService.client.get(`readiness:${userId}`);
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    async getUserApiUsage(userId) {
        const currentHour = new Date().getUTCHours();
        const keys = Array.from({ length: 24 }, (_, i) => `rate:${userId}:${i}`);
        const values = await this.redisService.client.mget(...keys);
        const hourlyBreakdown = values.map((v, i) => ({
            hour: i,
            calls: parseInt(v ?? '0'),
        }));
        const lastHourKey = `rate:${userId}:${currentHour}`;
        const lastHour = parseInt((await this.redisService.client.get(lastHourKey)) ?? '0');
        const total24h = hourlyBreakdown.reduce((sum, h) => sum + h.calls, 0);
        return { lastHour, total24h, hourlyBreakdown };
    }
    async getAdminUserVitals(userId) {
        const vitals = await this.influxDB.getLatestVitals(userId);
        const devices = await this.prisma.device.findMany({
            where: { userId, isActive: true },
            orderBy: { lastSyncAt: 'desc' },
        });
        const readinessRaw = await this.redisService.client.get('readiness:' + userId);
        const readiness = readinessRaw ? JSON.parse(readinessRaw) : null;
        return { vitals, devices, readiness };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        influxdb_service_1.InfluxDBService])
], UsersService);
//# sourceMappingURL=users.service.js.map