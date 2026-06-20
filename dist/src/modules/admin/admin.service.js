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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const admin_gateway_1 = require("../../gateways/admin.gateway");
const influxdb_service_1 = require("../influxdb/influxdb.service");
const kafkajs_1 = require("kafkajs");
let AdminService = class AdminService {
    prisma;
    redisService;
    adminGateway;
    influxDB;
    constructor(prisma, redisService, adminGateway, influxDB) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.adminGateway = adminGateway;
        this.influxDB = influxDB;
    }
    async getOverviewStats(from, to) {
        const startDate = from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = to ?? new Date();
        const totalUsers = await this.prisma.user.count();
        const usersToday = await this.prisma.user.count({
            where: { createdAt: { gte: startDate, lte: endDate } },
        });
        const totalDevices = await this.prisma.device.count();
        const ringCount = await this.prisma.device.count({
            where: { deviceType: 'SMART_RING' },
        });
        const bandCount = await this.prisma.device.count({
            where: { deviceType: 'WHOOP_BAND' },
        });
        const activeDevicesLast24h = await this.prisma.device.count({
            where: {
                lastSyncAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
        });
        const totalOrders = await this.prisma.order.count();
        const ordersToday = await this.prisma.order.count({
            where: { createdAt: { gte: startDate, lte: endDate } },
        });
        const revenueResult = await this.prisma.order.aggregate({
            _sum: { totalAmount: true },
        });
        const revenueTodayResult = await this.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { createdAt: { gte: startDate, lte: endDate } },
        });
        const activeAlerts = await this.prisma.alert.count({
            where: { isAcknowledged: false },
        });
        const aiInsightsToday = await this.prisma.aiInsight.count({
            where: { createdAt: { gte: startDate, lte: endDate } },
        });
        const workoutsThisWeek = await this.prisma.workoutLog.count({
            where: { date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        });
        const recentAlertsList = await this.prisma.alert.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
        });
        const usersByDay = await this.prisma.user.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: startDate, lte: endDate } },
            _count: { _all: true },
        });
        const vitalsByDay = await this.prisma.kafkaEventLog.groupBy({
            by: ['producedAt'],
            where: {
                topic: 'vitals.batch.uploaded',
                producedAt: { gte: startDate, lte: endDate }
            },
            _count: { _all: true },
        });
        const revenueByDay = await this.prisma.order.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { notIn: ['CANCELLED', 'REFUNDED'] }
            },
            _sum: { totalAmount: true },
        });
        let numDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
        if (numDays <= 0)
            numDays = 1;
        const chartData = Array.from({ length: numDays }).map((_, i) => {
            const d = new Date(endDate);
            d.setDate(d.getDate() - (numDays - 1 - i));
            const dateStr = d.toISOString().split('T')[0];
            const usersOnDay = usersByDay
                .filter((u) => u.createdAt.toISOString().split('T')[0] === dateStr)
                .reduce((sum, u) => sum + u._count._all, 0);
            const vitalsOnDay = vitalsByDay
                .filter(v => v.producedAt.toISOString().split('T')[0] === dateStr)
                .reduce((sum, v) => sum + v._count._all, 0);
            const revenueOnDay = revenueByDay
                .filter(r => r.createdAt.toISOString().split('T')[0] === dateStr)
                .reduce((sum, r) => sum + (r._sum.totalAmount ?? 0), 0);
            return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                users: usersOnDay,
                vitals: vitalsOnDay,
                revenue: revenueOnDay,
            };
        });
        const avgOrderValue = totalOrders > 0
            ? (revenueResult._sum.totalAmount ?? 0) / totalOrders
            : 0;
        const conversionRate = totalUsers > 0
            ? Math.round((totalOrders / totalUsers) * 100)
            : 0;
        const vitalsRecordedToday = await this.getVitalsCountToday();
        return {
            totalUsers,
            usersToday,
            totalDevices,
            ringCount,
            bandCount,
            activeDevicesLast24h,
            totalOrders,
            ordersToday,
            activeAlerts,
            aiInsightsToday,
            workoutsThisWeek,
            vitalsRecordedToday,
            chartData,
            recentAlerts: recentAlertsList,
            totalRevenue: revenueResult._sum.totalAmount ?? 0,
            revenueToday: revenueTodayResult._sum.totalAmount ?? 0,
            avgOrderValue,
            conversionRate,
        };
    }
    async getVitalsCountToday() {
        const fluxQuery = `
      from(bucket: "${this.influxDB.bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r["_measurement"] == "health_metrics")
        |> count()
        |> sum(column: "_value")
    `;
        try {
            let total = 0;
            for await (const { values, tableMeta } of this.influxDB.queryApi.iterateRows(fluxQuery)) {
                const row = tableMeta.toObject(values);
                total += row._value ?? 0;
            }
            return total;
        }
        catch {
            return 0;
        }
    }
    async getKafkaAuditLogs(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [total, events] = await Promise.all([
            this.prisma.kafkaEventLog.count(),
            this.prisma.kafkaEventLog.findMany({
                skip,
                take: limit,
                orderBy: { producedAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true } }
                }
            })
        ]);
        return {
            data: events,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async broadcastMessage(data, adminId) {
        const where = { isActive: true };
        if (data.segment === 'ring_users')
            where.devices = { some: { deviceType: 'SMART_RING' } };
        if (data.segment === 'band_users')
            where.devices = { some: { deviceType: 'WHOOP_BAND' } };
        const users = await this.prisma.user.findMany({ where, select: { id: true } });
        const broadcast = await this.prisma.broadcastMessage.create({
            data: {
                title: data.title,
                body: data.body,
                targetSegment: data.segment,
                sentByAdminId: adminId,
                recipientCount: users.length,
            }
        });
        if (users.length > 0) {
            await this.prisma.notification.createMany({
                data: users.map(u => ({
                    userId: u.id,
                    title: data.title,
                    body: data.body,
                    type: 'BROADCAST',
                    data: { broadcastId: broadcast.id }
                }))
            });
        }
        return { success: true, count: users.length };
    }
    async getFirmwareVersions() {
        return this.prisma.firmwareVersion.findMany({
            orderBy: { releasedAt: 'desc' },
        });
    }
    async createFirmwareVersion(data) {
        await this.prisma.$transaction(async (tx) => {
            await tx.firmwareVersion.updateMany({
                where: { deviceType: data.deviceType, isLatest: true },
                data: { isLatest: false },
            });
            await tx.firmwareVersion.create({
                data: {
                    ...data,
                    isLatest: true,
                },
            });
        });
        return { success: true };
    }
    async updateFirmwareVersion(id, isLatest) {
        if (isLatest) {
            const target = await this.prisma.firmwareVersion.findUnique({ where: { id } });
            if (target) {
                await this.prisma.$transaction(async (tx) => {
                    await tx.firmwareVersion.updateMany({
                        where: { deviceType: target.deviceType, isLatest: true },
                        data: { isLatest: false },
                    });
                    await tx.firmwareVersion.update({
                        where: { id },
                        data: { isLatest: true },
                    });
                });
            }
        }
        else {
            await this.prisma.firmwareVersion.update({
                where: { id },
                data: { isLatest },
            });
        }
        return { success: true };
    }
    async deleteFirmwareVersion(id) {
        await this.prisma.firmwareVersion.delete({ where: { id } });
        return { success: true };
    }
    async exportUsersReport() {
        const users = await this.prisma.user.findMany({
            include: { healthProfile: true, devices: { where: { isActive: true }, take: 1 } },
            orderBy: { createdAt: 'desc' },
        });
        const header = 'id,name,email,phone,role,isActive,deviceType,stepsGoal,fitnessLevel,joinedAt\n';
        const rows = users.map(u => [
            u.id, u.name, u.email, u.phone ?? '',
            u.role, u.isActive,
            u.devices[0]?.deviceType ?? '',
            u.healthProfile?.stepsGoal ?? '',
            u.healthProfile?.fitnessLevel ?? '',
            u.createdAt.toISOString(),
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        return header + rows;
    }
    async exportRevenueReport() {
        const orders = await this.prisma.order.findMany({
            include: { user: { select: { name: true, email: true } }, items: true },
            orderBy: { createdAt: 'desc' },
        });
        const header = 'orderId,userName,userEmail,status,totalAmount,itemCount,paymentMethod,createdAt\n';
        const rows = orders.map(o => [
            o.id, o.user.name, o.user.email, o.status,
            o.totalAmount, o.items.length, o.paymentMethod ?? '',
            o.createdAt.toISOString(),
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        return header + rows;
    }
    async exportDevicesReport() {
        const devices = await this.prisma.device.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const header = 'deviceId,serial,type,userName,userEmail,firmware,battery,isActive,lastSyncAt\n';
        const rows = devices.map(d => [
            d.id, d.deviceSerial, d.deviceType,
            d.user.name, d.user.email,
            d.firmwareVersion ?? '', d.batteryLevel ?? '',
            d.isActive, d.lastSyncAt?.toISOString() ?? '',
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        return header + rows;
    }
    async exportAlertsReport() {
        const alerts = await this.prisma.alert.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const header = 'alertId,userName,userEmail,alertType,severity,message,isRead,isAcknowledged,createdAt\n';
        const rows = alerts.map(a => [
            a.id, a.user.name, a.user.email,
            a.alertType, a.severity, a.message,
            a.isRead, a.isAcknowledged, a.createdAt.toISOString(),
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        return header + rows;
    }
    async getSystemHealth() {
        const [redisResult, wsResult, responseResult] = await Promise.allSettled([
            this.getRedisStats(),
            this.getWebSocketStats(),
            this.getResponseTimeStats(),
        ]);
        return {
            api: {
                status: 'healthy',
                uptime: process.uptime(),
                latency: responseResult.status === 'fulfilled' ? responseResult.value.p50Ms : 0,
                p95Ms: responseResult.status === 'fulfilled' ? responseResult.value.p95Ms : 0,
            },
            database: await this.getDatabaseStats(),
            redis: redisResult.status === 'fulfilled' ? redisResult.value : { status: 'error', error: true },
            kafka: await this.getKafkaStats(),
            websocket: wsResult.status === 'fulfilled' ? wsResult.value : { status: 'error', error: true },
            checkedAt: new Date().toISOString(),
        };
    }
    async getRedisStats() {
        const [info, dbSize] = await Promise.all([
            this.redisService.client.info('memory'),
            this.redisService.client.dbsize(),
        ]);
        const clientInfo = await this.redisService.client.info('clients');
        const memMatch = info.match(/used_memory_human:(\S+)/);
        const peakMatch = info.match(/used_memory_peak_human:(\S+)/);
        const connMatch = clientInfo.match(/connected_clients:(\d+)/);
        return {
            status: 'healthy',
            usedMemory: memMatch?.[1] ?? 'N/A',
            peakMemory: peakMatch?.[1] ?? 'N/A',
            connectedClients: parseInt(connMatch?.[1] ?? '0'),
            totalKeys: dbSize,
        };
    }
    async getDatabaseStats() {
        const start = Date.now();
        await this.prisma.$queryRaw `SELECT 1`;
        const latency = Date.now() - start;
        return { status: 'healthy', latency };
    }
    async getKafkaStats() {
        const consumerGroups = [
            'sv-consumer-user', 'sv-consumer-order', 'sv-consumer-alert',
            'sv-consumer-vitals', 'sv-consumer-device', 'sv-consumer-notification',
            'sv-consumer-workout', 'sv-consumer-meditation', 'sv-consumer-ai'
        ];
        try {
            const kafka = new kafkajs_1.Kafka({
                clientId: process.env.KAFKA_CLIENT_ID || 'smartvital-health-check',
                brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
            });
            const admin = kafka.admin();
            await admin.connect();
            const [cluster, topicMetadata] = await Promise.all([
                admin.describeCluster(),
                admin.fetchTopicMetadata(),
            ]);
            const groupLag = await Promise.all(consumerGroups.map(async (groupId) => {
                try {
                    const offsets = await admin.fetchOffsets({ groupId, resolveOffsets: true });
                    const totalLag = offsets.reduce((sum, topic) => sum + topic.partitions.reduce((s, p) => s + Math.max(0, parseInt(p.offset) - parseInt(p.high ?? p.offset)), 0), 0);
                    return { groupId, lag: totalLag, status: totalLag > 1000 ? 'warning' : 'healthy' };
                }
                catch {
                    return { groupId, lag: -1, status: 'error' };
                }
            }));
            await admin.disconnect();
            return {
                status: 'healthy',
                activeBrokers: cluster.brokers.length,
                partitions: topicMetadata.topics.reduce((sum, t) => sum + t.partitions.length, 0),
                consumerGroups: groupLag,
            };
        }
        catch (e) {
            return { status: 'error', activeBrokers: 0, partitions: 0, consumerGroups: [] };
        }
    }
    getWebSocketStats() {
        const adminCount = this.adminGateway?.server?.sockets?.sockets?.size ?? 0;
        return {
            status: 'healthy',
            connectedAdmins: adminCount,
            connectedUsers: 0
        };
    }
    async getResponseTimeStats() {
        try {
            const times = await this.redisService.client.zrange('metrics:response_times', 0, -1, 'WITHSCORES');
            if (times.length === 0)
                return { p50Ms: 0, p95Ms: 0 };
            const values = times.filter((_, i) => i % 2 === 0).map(Number).sort((a, b) => a - b);
            const p50 = values[Math.floor(values.length * 0.5)] ?? 0;
            const p95 = values[Math.floor(values.length * 0.95)] ?? 0;
            return { p50Ms: p50, p95Ms: p95 };
        }
        catch {
            return { p50Ms: 0, p95Ms: 0 };
        }
    }
    async globalSearch(query) {
        if (!query || query.length < 2)
            return { users: [], orders: [], devices: [] };
        const [users, orders, devices] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } },
                    ]
                },
                take: 5,
                select: { id: true, name: true, email: true, role: true },
            }),
            this.prisma.order.findMany({
                where: { id: { contains: query, mode: 'insensitive' } },
                take: 5,
                include: { user: { select: { name: true } } },
            }),
            this.prisma.device.findMany({
                where: {
                    OR: [
                        { deviceSerial: { contains: query, mode: 'insensitive' } },
                        { deviceName: { contains: query, mode: 'insensitive' } },
                    ]
                },
                take: 5,
                include: { user: { select: { name: true } } },
            }),
        ]);
        return { users, orders, devices };
    }
    async getAuditLog(page, limit, userId, topic, from, to) {
        const where = {};
        if (userId)
            where.userId = userId;
        if (topic)
            where.topic = { contains: topic, mode: 'insensitive' };
        if (from || to) {
            where.producedAt = {};
            if (from)
                where.producedAt.gte = new Date(from);
            if (to)
                where.producedAt.lte = new Date(to);
        }
        const [data, total] = await Promise.all([
            this.prisma.kafkaEventLog.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { producedAt: 'desc' },
                include: { user: { select: { name: true, email: true } } }
            }),
            this.prisma.kafkaEventLog.count({ where }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        admin_gateway_1.AdminGateway,
        influxdb_service_1.InfluxDBService])
], AdminService);
//# sourceMappingURL=admin.service.js.map