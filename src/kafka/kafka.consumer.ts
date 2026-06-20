import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

export abstract class BaseConsumer implements OnModuleInit, OnModuleDestroy {
  protected kafka: Kafka;
  protected consumer: Consumer;
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly groupId: string,
    protected readonly topics: string[],
  ) {}

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'smartvital-api',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });

    this.consumer = this.kafka.consumer({ groupId: this.groupId });

    try {
      await this.consumer.connect();
      for (const topic of this.topics) {
        await this.consumer.subscribe({ topic, fromBeginning: false });
      }

      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          try {
            await this.handleMessage(payload);
          } catch (error) {
            this.logger.error(
              `Error processing message from topic ${payload.topic}`,
              error,
            );
            // In a real production system, send to DLT here
          }
        },
      });
      this.logger.log(
        `Kafka consumer connected and subscribed to [${this.topics.join(', ')}]`,
      );
    } catch (e) {
      this.logger.error('Failed to start Kafka consumer', e);
    }
  }

  abstract handleMessage(payload: EachMessagePayload): Promise<void>;

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
