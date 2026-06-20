import { Injectable } from '@nestjs/common';
import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from '../topics';
import { AdminGateway } from '../../gateways/admin.gateway';

@Injectable()
export class WorkoutConsumer extends BaseConsumer {
  constructor(private readonly adminGateway: AdminGateway) {
    super(
      process.env.KAFKA_GROUP_ID
        ? process.env.KAFKA_GROUP_ID + '-workout'
        : 'sv-consumer-workout',
      [
        KAFKA_TOPICS.WORKOUT_PLAN_CREATED,
        KAFKA_TOPICS.WORKOUT_LOGGED,
        KAFKA_TOPICS.WORKOUT_PLAN_COMPLETED,
      ],
    );
  }

  async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    const payload = JSON.parse(message.value?.toString() || '{}');

    switch (topic) {
      case KAFKA_TOPICS.WORKOUT_PLAN_CREATED:
        this.adminGateway.emitNewWorkoutPlan(payload);
        break;
      case KAFKA_TOPICS.WORKOUT_LOGGED:
        this.adminGateway.emitWorkoutLogged(payload);
        break;
      case KAFKA_TOPICS.WORKOUT_PLAN_COMPLETED:
        // Handle completion logic if any
        break;
    }
  }
}
