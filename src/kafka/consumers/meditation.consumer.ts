import { Injectable } from '@nestjs/common';
import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from '../topics';
import { AdminGateway } from '../../gateways/admin.gateway';

@Injectable()
export class MeditationConsumer extends BaseConsumer {
  constructor(private readonly adminGateway: AdminGateway) {
    super(
      process.env.KAFKA_GROUP_ID
        ? process.env.KAFKA_GROUP_ID + '-meditation'
        : 'sv-consumer-meditation',
      [KAFKA_TOPICS.MEDITATION_SESSION_DONE],
    );
  }

  async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    const payload = JSON.parse(message.value?.toString() || '{}');

    switch (topic) {
      case KAFKA_TOPICS.MEDITATION_SESSION_DONE:
        this.adminGateway.emitMeditationCompleted(payload);
        break;
    }
  }
}
