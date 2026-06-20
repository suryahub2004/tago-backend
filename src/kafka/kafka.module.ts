import { Global, Module } from '@nestjs/common';
import { KafkaProducer } from './kafka.producer';
import { UserConsumer } from './consumers/user.consumer';
import { OrderConsumer } from './consumers/order.consumer';
import { AlertConsumer } from './consumers/alert.consumer';
import { VitalsConsumer } from './consumers/vitals.consumer';
import { DeviceConsumer } from './consumers/device.consumer';
import { NotificationConsumer } from './consumers/notification.consumer';
import { WorkoutConsumer } from './consumers/workout.consumer';
import { MeditationConsumer } from './consumers/meditation.consumer';
import { AiInsightConsumer } from './consumers/ai-insight.consumer';
import { AdminGateway } from '../gateways/admin.gateway';
import { AppGateway } from '../gateways/app.gateway';
import { VitalsGateway } from '../gateways/vitals.gateway';
import { PrismaModule } from '../database/prisma/prisma.module';

import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [PrismaModule, JwtModule.register({})],
  providers: [
    KafkaProducer,
    AdminGateway,
    AppGateway,
    VitalsGateway,
    UserConsumer,
    OrderConsumer,
    AlertConsumer,
    VitalsConsumer,
    DeviceConsumer,
    NotificationConsumer,
    WorkoutConsumer,
    MeditationConsumer,
    AiInsightConsumer,
  ],
  exports: [KafkaProducer, AdminGateway, AppGateway, VitalsGateway],
})
export class KafkaModule {}
