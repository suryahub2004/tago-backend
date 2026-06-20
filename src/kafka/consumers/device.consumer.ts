import { Injectable } from '@nestjs/common';
import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from '../topics';
import { AdminGateway } from '../../gateways/admin.gateway';
import { DevicePairedEvent } from '../../types';

@Injectable()
export class DeviceConsumer extends BaseConsumer {
  constructor(private readonly adminGateway: AdminGateway) {
    super(
      process.env.KAFKA_GROUP_ID
        ? process.env.KAFKA_GROUP_ID + '-device'
        : 'sv-consumer-device',
      [
        KAFKA_TOPICS.DEVICE_PAIRED,
        KAFKA_TOPICS.DEVICE_LOW_BATTERY,
        KAFKA_TOPICS.DEVICE_INFO_UPDATED,
      ],
    );
  }

  async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    const payload = JSON.parse(message.value?.toString() || '{}');

    switch (topic) {
      case KAFKA_TOPICS.DEVICE_PAIRED:
        const deviceEvent = payload as DevicePairedEvent;
        this.adminGateway.emitNewDevice(deviceEvent);
        this.adminGateway.emitStatsRefresh();
        break;

      case KAFKA_TOPICS.DEVICE_LOW_BATTERY:
        // Produce notification.send event here for outbox pattern
        break;

      case KAFKA_TOPICS.DEVICE_INFO_UPDATED:
        this.adminGateway.emitDeviceUpdated(payload);
        break;
    }
  }
}
