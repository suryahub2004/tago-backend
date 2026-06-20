import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { KAFKA_TOPICS } from '../../kafka/topics';
import { v4 as uuid } from 'uuid';
import { AdminGateway } from '../../gateways/admin.gateway';
import { AppGateway } from '../../gateways/app.gateway';

@Processor('alerts-queue')
export class AlertsProcessor {
  private readonly logger = new Logger(AlertsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private kafkaProducer: KafkaProducer,
    private adminGateway: AdminGateway,
    private appGateway: AppGateway,
  ) {}

  @Process()
  async handleProcessAlerts(job: Job<any>): Promise<any> {
    const { type, data } = job.data;
    this.logger.debug(`Processing alert job of type ${type}`);

    if (data && data.userId && data.severity) {
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });
      if (!user) return { success: false, reason: 'User not found' };

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
        severity: alert.severity as any,
        message: alert.message,
        metricValue: data.metricValue ?? 0,
        threshold: data.threshold ?? 0,
      };

      // ── Push to Flutter app via /app WebSocket ────────────────────────────
      this.appGateway.emitVitalsAnomaly(user.id, anomalyPayload);

      // ── Push to admin dashboard via /admin WebSocket ──────────────────────
      this.adminGateway.emitCriticalAlert({
        alertId: alert.id,
        userId: user.id,
        userName: user.name,
        alertType: alert.alertType,
        severity: alert.severity as any,
        message: alert.message,
        metricValue: data.metricValue ?? 0,
        threshold: data.threshold ?? 0,
        parentUserIds: data.parentUserIds ?? [],
        fcmTokens: data.fcmTokens ?? [],
        eventId: uuid(),
        occurredAt: new Date().toISOString(),
        version: '1.0',
      });

      // ── Kafka event for downstream consumers (notifications, FCM) ─────────
      await this.kafkaProducer.publish(KAFKA_TOPICS.ALERT_TRIGGERED, {
        eventId: uuid(),
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
}
