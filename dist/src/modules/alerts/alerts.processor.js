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
var AlertsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const kafka_producer_1 = require("../../kafka/kafka.producer");
const topics_1 = require("../../kafka/topics");
const uuid_1 = require("uuid");
const admin_gateway_1 = require("../../gateways/admin.gateway");
const app_gateway_1 = require("../../gateways/app.gateway");
let AlertsProcessor = AlertsProcessor_1 = class AlertsProcessor {
    prisma;
    kafkaProducer;
    adminGateway;
    appGateway;
    logger = new common_1.Logger(AlertsProcessor_1.name);
    constructor(prisma, kafkaProducer, adminGateway, appGateway) {
        this.prisma = prisma;
        this.kafkaProducer = kafkaProducer;
        this.adminGateway = adminGateway;
        this.appGateway = appGateway;
    }
    async handleProcessAlerts(job) {
        const { type, data } = job.data;
        this.logger.debug(`Processing alert job of type ${type}`);
        if (data && data.userId && data.severity) {
            const user = await this.prisma.user.findUnique({
                where: { id: data.userId },
            });
            if (!user)
                return { success: false, reason: 'User not found' };
            const alert = await this.prisma.alert.create({
                data: {
                    userId: user.id,
                    alertType: data.alertType || 'HIGH_HR',
                    severity: data.severity,
                    message: data.message || 'Abnormal reading detected',
                },
            });
            const anomalyPayload = {
                alertId: alert.id,
                userId: user.id,
                alertType: alert.alertType,
                severity: alert.severity,
                message: alert.message,
                metricValue: data.metricValue ?? 0,
                threshold: data.threshold ?? 0,
            };
            this.appGateway.emitVitalsAnomaly(user.id, anomalyPayload);
            this.adminGateway.emitCriticalAlert({
                alertId: alert.id,
                userId: user.id,
                userName: user.name,
                alertType: alert.alertType,
                severity: alert.severity,
                message: alert.message,
                metricValue: data.metricValue ?? 0,
                threshold: data.threshold ?? 0,
                parentUserIds: data.parentUserIds ?? [],
                fcmTokens: data.fcmTokens ?? [],
                eventId: (0, uuid_1.v4)(),
                occurredAt: new Date().toISOString(),
                version: '1.0',
            });
            await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.ALERT_TRIGGERED, {
                eventId: (0, uuid_1.v4)(),
                occurredAt: new Date().toISOString(),
                version: '1.0',
                alertId: alert.id,
                userId: user.id,
                userName: user.name,
                alertType: alert.alertType,
                severity: alert.severity,
                message: alert.message,
                metricValue: data.metricValue ?? 0,
                threshold: data.threshold ?? 0,
                parentUserIds: data.parentUserIds ?? [],
                fcmTokens: data.fcmTokens ?? [],
            });
        }
        return { success: true };
    }
};
exports.AlertsProcessor = AlertsProcessor;
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertsProcessor.prototype, "handleProcessAlerts", null);
exports.AlertsProcessor = AlertsProcessor = AlertsProcessor_1 = __decorate([
    (0, bull_1.Processor)('alerts-queue'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        kafka_producer_1.KafkaProducer,
        admin_gateway_1.AdminGateway,
        app_gateway_1.AppGateway])
], AlertsProcessor);
//# sourceMappingURL=alerts.processor.js.map