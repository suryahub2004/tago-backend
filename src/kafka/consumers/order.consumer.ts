import { Injectable } from '@nestjs/common';
import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from '../topics';
import { AdminGateway } from '../../gateways/admin.gateway';
import { OrderCreatedEvent, OrderStatusChangedEvent } from '../../types';

@Injectable()
export class OrderConsumer extends BaseConsumer {
  constructor(private readonly adminGateway: AdminGateway) {
    super(
      process.env.KAFKA_GROUP_ID
        ? process.env.KAFKA_GROUP_ID + '-order'
        : 'sv-consumer-order',
      [KAFKA_TOPICS.ORDER_CREATED, KAFKA_TOPICS.ORDER_STATUS_UPDATED],
    );
  }

  async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    const payload = JSON.parse(message.value?.toString() || '{}');

    switch (topic) {
      case KAFKA_TOPICS.ORDER_CREATED:
        const orderEvent = payload as OrderCreatedEvent;
        this.adminGateway.emitNewOrder(orderEvent);
        this.adminGateway.emitStatsRefresh();
        break;

      case KAFKA_TOPICS.ORDER_STATUS_UPDATED:
        const statusEvent = payload; // Using any or assuming it has same shape
        this.adminGateway.emitOrderUpdated(statusEvent);
        break;
    }
  }
}
