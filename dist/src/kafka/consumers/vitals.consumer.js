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
exports.VitalsConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafka_consumer_1 = require("../kafka.consumer");
const topics_1 = require("../topics");
const admin_gateway_1 = require("../../gateways/admin.gateway");
const vitals_gateway_1 = require("../../gateways/vitals.gateway");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const client_1 = require("@prisma/client");
let VitalsConsumer = class VitalsConsumer extends kafka_consumer_1.BaseConsumer {
    adminGateway;
    vitalsGateway;
    prisma;
    constructor(adminGateway, vitalsGateway, prisma) {
        super(process.env.KAFKA_GROUP_ID
            ? process.env.KAFKA_GROUP_ID + '-vitals'
            : 'sv-consumer-vitals', [topics_1.KAFKA_TOPICS.VITALS_BATCH_UPLOADED]);
        this.adminGateway = adminGateway;
        this.vitalsGateway = vitalsGateway;
        this.prisma = prisma;
    }
    async handleMessage({ topic, message }) {
        const payload = JSON.parse(message.value?.toString() || '{}');
        if (topic !== topics_1.KAFKA_TOPICS.VITALS_BATCH_UPLOADED)
            return;
        const vitalsEvent = payload;
        const { latestReadings, userId } = vitalsEvent;
        this.adminGateway.emitDeviceSynced({ ...vitalsEvent, batteryLevel: 100 });
        this.adminGateway.emitStatsRefresh();
        if (latestReadings && userId) {
            try {
                const memberships = await this.prisma.familyMember.findMany({
                    where: {
                        memberUserId: userId,
                        inviteAccepted: true,
                        isActive: true,
                    },
                    select: { familyGroupId: true },
                });
                for (const { familyGroupId } of memberships) {
                    if (latestReadings.heart_rate) {
                        this.vitalsGateway.broadcastLiveVitals(familyGroupId, {
                            userId,
                            type: 'heart_rate',
                            value: latestReadings.heart_rate,
                        });
                    }
                    if (latestReadings.spo2) {
                        this.vitalsGateway.broadcastLiveVitals(familyGroupId, {
                            userId,
                            type: 'spo2',
                            value: latestReadings.spo2,
                        });
                    }
                }
            }
            catch (e) {
            }
        }
        if (!latestReadings || !userId)
            return;
        let alertType = null;
        let severity = client_1.AlertSeverity.INFO;
        let alertMessage = '';
        let metricValue = 0;
        let threshold = 0;
        if (latestReadings.heart_rate && latestReadings.heart_rate > 120) {
            alertType = 'HIGH_HEART_RATE';
            severity = client_1.AlertSeverity.WARNING;
            alertMessage = `Abnormal heart rate detected: ${latestReadings.heart_rate} bpm`;
            metricValue = latestReadings.heart_rate;
            threshold = 120;
        }
        else if (latestReadings.spo2 && latestReadings.spo2 < 92) {
            alertType = 'LOW_SPO2';
            severity = client_1.AlertSeverity.CRITICAL;
            alertMessage = `Critically low SpO2 detected: ${latestReadings.spo2}%`;
            metricValue = latestReadings.spo2;
            threshold = 92;
        }
        if (!alertType)
            return;
        try {
            const alert = await this.prisma.alert.create({
                data: { userId, alertType, severity, message: alertMessage },
                include: { user: { select: { name: true } } },
            });
            this.adminGateway.emitCriticalAlert({
                eventId: `alert-${alert.id}`,
                occurredAt: alert.createdAt.toISOString(),
                version: '1.0',
                userId,
                userName: alert.user?.name || 'Unknown',
                alertId: alert.id,
                alertType: alert.alertType,
                severity: alert.severity,
                message: alert.message,
                metricValue,
                threshold,
                parentUserIds: [],
                fcmTokens: [],
            });
        }
        catch { }
    }
};
exports.VitalsConsumer = VitalsConsumer;
exports.VitalsConsumer = VitalsConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_gateway_1.AdminGateway,
        vitals_gateway_1.VitalsGateway,
        prisma_service_1.PrismaService])
], VitalsConsumer);
//# sourceMappingURL=vitals.consumer.js.map