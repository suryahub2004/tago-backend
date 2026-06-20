import { Injectable } from '@nestjs/common';
import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from '../topics';
import { AdminGateway } from '../../gateways/admin.gateway';
import { VitalsGateway } from '../../gateways/vitals.gateway';
import { VitalsBatchUploadedEvent } from '../../types';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AlertSeverity } from '@prisma/client';

@Injectable()
export class VitalsConsumer extends BaseConsumer {
  constructor(
    private readonly adminGateway: AdminGateway,
    private readonly vitalsGateway: VitalsGateway,
    private readonly prisma: PrismaService,
  ) {
    super(
      process.env.KAFKA_GROUP_ID
        ? process.env.KAFKA_GROUP_ID + '-vitals'
        : 'sv-consumer-vitals',
      [KAFKA_TOPICS.VITALS_BATCH_UPLOADED],
    );
  }

  async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    const payload = JSON.parse(message.value?.toString() || '{}');

    if (topic !== KAFKA_TOPICS.VITALS_BATCH_UPLOADED) return;

    const vitalsEvent = payload as VitalsBatchUploadedEvent;
    const { latestReadings, userId } = vitalsEvent;

    // 1. Notify dashboard that a device synced
    this.adminGateway.emitDeviceSynced({ ...vitalsEvent, batteryLevel: 100 });
    this.adminGateway.emitStatsRefresh();

    // 2. Broadcast live vitals to every family group this user belongs to
    //    so family members' screens update in real-time
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
          // Emit each metric as a separate vital_update event so the Flutter
          // FamilyHubController._updateVital() handler can process it
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
      } catch (e) {
        // Non-fatal — family broadcast failure should not block pipeline
      }
    }

    // 3. Alert evaluation
    if (!latestReadings || !userId) return;

    let alertType: string | null = null;
    let severity: AlertSeverity = AlertSeverity.INFO;
    let alertMessage = '';
    let metricValue = 0;
    let threshold = 0;

    if (latestReadings.heart_rate && latestReadings.heart_rate > 120) {
      alertType = 'HIGH_HEART_RATE';
      severity = AlertSeverity.WARNING;
      alertMessage = `Abnormal heart rate detected: ${latestReadings.heart_rate} bpm`;
      metricValue = latestReadings.heart_rate;
      threshold = 120;
    } else if (latestReadings.spo2 && latestReadings.spo2 < 92) {
      alertType = 'LOW_SPO2';
      severity = AlertSeverity.CRITICAL;
      alertMessage = `Critically low SpO2 detected: ${latestReadings.spo2}%`;
      metricValue = latestReadings.spo2;
      threshold = 92;
    }

    if (!alertType) return;

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
        severity: alert.severity as 'INFO' | 'WARNING' | 'CRITICAL',
        message: alert.message,
        metricValue,
        threshold,
        parentUserIds: [],
        fcmTokens: [],
      });
    } catch { /* non-fatal */ }
  }
}
