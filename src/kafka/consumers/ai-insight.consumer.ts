import { Injectable } from '@nestjs/common';
import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from '../topics';
import { AdminGateway } from '../../gateways/admin.gateway';

@Injectable()
export class AiInsightConsumer extends BaseConsumer {
  constructor(private readonly adminGateway: AdminGateway) {
    super(
      process.env.KAFKA_GROUP_ID
        ? process.env.KAFKA_GROUP_ID + '-ai'
        : 'sv-consumer-ai',
      [KAFKA_TOPICS.AI_INSIGHT_GENERATED],
    );
  }

  async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    const payload = JSON.parse(message.value?.toString() || '{}');

    switch (topic) {
      case KAFKA_TOPICS.AI_INSIGHT_GENERATED:
        this.adminGateway.emitNewAiInsight(payload);
        break;
    }
  }
}
