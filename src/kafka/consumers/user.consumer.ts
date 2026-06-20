import { Injectable } from '@nestjs/common';
import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from '../topics';
import { AdminGateway } from '../../gateways/admin.gateway';
import { UserRegisteredEvent } from '../../types';
import { KafkaProducer } from '../kafka.producer';

@Injectable()
export class UserConsumer extends BaseConsumer {
  constructor(
    private readonly adminGateway: AdminGateway,
    private readonly kafkaProducer: KafkaProducer,
  ) {
    super(
      process.env.KAFKA_GROUP_ID
        ? process.env.KAFKA_GROUP_ID + '-user'
        : 'sv-consumer-user',
      [KAFKA_TOPICS.USER_REGISTERED, KAFKA_TOPICS.USER_UPDATED],
    );
  }

  async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    const payload = JSON.parse(message.value?.toString() || '{}');

    switch (topic) {
      case KAFKA_TOPICS.USER_REGISTERED:
        const userEvent = payload as UserRegisteredEvent;
        this.adminGateway.emitNewUser(userEvent);
        this.adminGateway.emitStatsRefresh();

        // Produce welcome push notification (outbox pattern)
        // await this.kafkaProducer.publish(KAFKA_TOPICS.NOTIFICATION_SEND, { ... })
        break;

      case KAFKA_TOPICS.USER_UPDATED:
        this.adminGateway.emitUserUpdated({ userId: payload.userId });
        break;
    }
  }
}
