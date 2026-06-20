import { Injectable } from '@nestjs/common';
import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from '../topics';
import { AdminGateway } from '../../gateways/admin.gateway';
import { AlertTriggeredEvent } from '../../types';

@Injectable()
export class AlertConsumer extends BaseConsumer {
  constructor(private readonly adminGateway: AdminGateway) {
    super(
      process.env.KAFKA_GROUP_ID
        ? process.env.KAFKA_GROUP_ID + '-alert'
        : 'sv-consumer-alert',
      [KAFKA_TOPICS.ALERT_TRIGGERED],
    );
  }

  async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    const payload = JSON.parse(message.value?.toString() || '{}');

    if (topic === KAFKA_TOPICS.ALERT_TRIGGERED) {
      const alertEvent = payload as AlertTriggeredEvent;
      if (alertEvent.severity === 'CRITICAL') {
        this.adminGateway.emitCriticalAlert(alertEvent);
      }
    }
  }
}
