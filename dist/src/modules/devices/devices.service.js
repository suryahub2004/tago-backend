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
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const kafka_producer_1 = require("../../kafka/kafka.producer");
const topics_1 = require("../../kafka/topics");
const uuid_1 = require("uuid");
let DevicesService = class DevicesService {
    prisma;
    kafkaProducer;
    constructor(prisma, kafkaProducer) {
        this.prisma = prisma;
        this.kafkaProducer = kafkaProducer;
    }
    async pairDevice(userId, dto) {
        const existing = await this.prisma.device.findUnique({
            where: { deviceSerial: dto.deviceSerial },
        });
        if (existing) {
            if (existing.userId === userId) {
                return this.prisma.device.update({
                    where: { id: existing.id },
                    data: { isActive: true },
                });
            }
            throw new common_1.BadRequestException('Device already paired with another account');
        }
        const device = await this.prisma.device.create({
            data: {
                userId,
                deviceSerial: dto.deviceSerial,
                deviceType: dto.deviceType,
                deviceName: dto.deviceName,
                isActive: true,
            },
        });
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.DEVICE_PAIRED, {
                eventId: (0, uuid_1.v4)(),
                occurredAt: new Date().toISOString(),
                version: '1.0',
                deviceId: device.id,
                userId: user.id,
                userName: user.name,
                deviceType: device.deviceType,
                deviceSerial: device.deviceSerial,
                firmwareVersion: device.firmwareVersion || '1.0.0',
            });
        }
        return device;
    }
    async unpairDevice(userId, deviceId) {
        const device = await this.prisma.device.findFirst({
            where: { id: deviceId, userId },
        });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        return this.prisma.device.update({
            where: { id: deviceId },
            data: { isActive: false },
        });
    }
    async getMyDevices(userId) {
        return this.prisma.device.findMany({
            where: { userId, isActive: true },
            orderBy: { pairedAt: 'desc' },
        });
    }
    async updateSettings(userId, deviceId, dto) {
        const device = await this.prisma.device.findFirst({
            where: { id: deviceId, userId },
        });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        return this.prisma.device.update({
            where: { id: deviceId },
            data: { settings: dto.settings },
        });
    }
    async updateFirmwareAndBattery(userId, deviceId, dto) {
        const device = await this.prisma.device.findFirst({
            where: { id: deviceId, userId },
        });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        const updatedDevice = await this.prisma.device.update({
            where: { id: deviceId },
            data: {
                firmwareVersion: dto.firmwareVersion ?? device.firmwareVersion,
                batteryLevel: dto.batteryLevel ?? device.batteryLevel,
                lastSyncAt: new Date(),
            },
        });
        if (dto.batteryLevel !== undefined && dto.batteryLevel < 20) {
            await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.DEVICE_LOW_BATTERY, {
                eventId: (0, uuid_1.v4)(),
                occurredAt: new Date().toISOString(),
                version: '1.0',
                deviceId: updatedDevice.id,
                userId: updatedDevice.userId,
                deviceType: updatedDevice.deviceType,
                batteryLevel: dto.batteryLevel,
                readingsCount: 0,
            });
        }
        return updatedDevice;
    }
    async getAdminDevicesAnalytics() {
        const totalDevices = await this.prisma.device.count();
        const ringCount = await this.prisma.device.count({
            where: { deviceType: 'SMART_RING' },
        });
        const bandCount = await this.prisma.device.count({
            where: { deviceType: 'WHOOP_BAND' },
        });
        const avgBatteryObj = await this.prisma.device.aggregate({
            _avg: { batteryLevel: true },
            where: { isActive: true },
        });
        return {
            totalDevices,
            ringCount,
            bandCount,
            avgBattery: avgBatteryObj._avg.batteryLevel,
        };
    }
    async getFleetHealth() {
        const [lowBattery, offlineDevices, firmwareStats, totalActive] = await Promise.all([
            this.prisma.device.count({
                where: { batteryLevel: { lt: 20 }, isActive: true },
            }),
            this.prisma.device.count({
                where: {
                    isActive: true,
                    lastSyncAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
                },
            }),
            this.prisma.device.groupBy({
                by: ['firmwareVersion', 'deviceType'],
                _count: { id: true },
                where: { isActive: true },
                orderBy: { _count: { id: 'desc' } },
            }),
            this.prisma.device.count({ where: { isActive: true } }),
        ]);
        const latestFirmware = await this.prisma.firmwareVersion.findMany({
            where: { isLatest: true },
            select: { deviceType: true, version: true },
        });
        const latestMap = Object.fromEntries(latestFirmware.map((f) => [f.deviceType, f.version]));
        const firmwareAdoption = firmwareStats.map((row) => ({
            version: row.firmwareVersion ?? 'Unknown',
            deviceType: row.deviceType,
            count: row._count.id,
            isLatest: row.firmwareVersion === latestMap[row.deviceType],
            adoptionRate: totalActive > 0 ? Math.round((row._count.id / totalActive) * 100) : 0,
        }));
        return {
            totalActive,
            lowBattery: {
                count: lowBattery,
                percent: totalActive > 0 ? Math.round((lowBattery / totalActive) * 100) : 0,
            },
            offline: {
                count: offlineDevices,
                percent: totalActive > 0
                    ? Math.round((offlineDevices / totalActive) * 100)
                    : 0,
            },
            firmwareAdoption,
            latestVersions: latestMap,
        };
    }
    async getAdminDevices(page, limit, deviceType, isActive, search) {
        const where = {};
        if (deviceType)
            where.deviceType = deviceType;
        if (isActive !== undefined)
            where.isActive = isActive;
        if (search) {
            where.OR = [
                { deviceSerial: { contains: search, mode: 'insensitive' } },
                { deviceName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.device.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.device.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async checkFirmware(userId, deviceId) {
        const device = await this.prisma.device.findFirst({
            where: { id: deviceId, userId },
        });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        const latest = await this.prisma.firmwareVersion.findFirst({
            where: { deviceType: device.deviceType, isLatest: true },
            orderBy: { releasedAt: 'desc' },
        });
        if (!latest) {
            return {
                currentVersion: device.firmwareVersion,
                hasUpdate: false,
            };
        }
        return {
            currentVersion: device.firmwareVersion,
            latestVersion: latest.version,
            hasUpdate: device.firmwareVersion !== latest.version,
            releaseNotes: latest.releaseNotes,
            releaseDate: latest.releasedAt,
        };
    }
    async getFirmwareFile(version) {
        const firmware = await this.prisma.firmwareVersion.findFirst({
            where: { version },
        });
        if (!firmware)
            throw new common_1.NotFoundException('Firmware not found');
        return {
            url: `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET || 'bucket'}/${firmware.s3Key}`,
        };
    }
    async updateBySerial(serial, userId, dto) {
        const device = await this.prisma.device.findFirst({
            where: { deviceSerial: serial, userId },
        });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        const updated = await this.prisma.device.update({
            where: { id: device.id },
            data: {
                ...dto,
                lastSyncAt: dto.lastSyncAt ? new Date(dto.lastSyncAt) : undefined,
            },
        });
        await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.DEVICE_INFO_UPDATED, {
            eventId: (0, uuid_1.v4)(),
            occurredAt: new Date().toISOString(),
            version: '1.0',
            deviceId: device.id,
            userId,
            deviceName: updated.deviceName,
            firmwareVersion: updated.firmwareVersion,
            batteryLevel: updated.batteryLevel,
        });
        return updated;
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        kafka_producer_1.KafkaProducer])
], DevicesService);
//# sourceMappingURL=devices.service.js.map