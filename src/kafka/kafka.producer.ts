import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { PrismaService } from '../database/prisma/prisma.service';
import { KafkaEventBase } from '../types';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private readonly logger = new Logger(KafkaProducer.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'smartvital-api',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected');
    } catch (e) {
      this.logger.error('Failed to connect Kafka producer', e);
    }
  }

  async publish<T extends KafkaEventBase>(
    topic: string,
    payload: T,
    key?: string,
  ): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: key ?? payload.eventId,
            value: JSON.stringify(payload),
            headers: {
              version: payload.version,
              occurredAt: payload.occurredAt,
            },
          },
        ],
      });
      // Log to KafkaEventLog table for audit (fire and forget)
      this.prisma.kafkaEventLog
        .create({
          data: {
            topic,
            key: key ?? payload.eventId,
            payload: payload as any,
            userId: (payload as any).userId || null,
          },
        })
        .catch((e: any) =>
          this.logger.error('Failed to write KafkaEventLog', e),
        );
    } catch (e) {
      this.logger.error(`Failed to publish event to topic ${topic}`, e);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}
