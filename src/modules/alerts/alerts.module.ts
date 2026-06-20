import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertsProcessor } from './alerts.processor';
import { PrismaModule } from '../../database/prisma/prisma.module';
// KafkaModule is @Global() — it exports KafkaProducer, AdminGateway, and AppGateway
// so AlertsProcessor can inject all three without re-declaring them here.
import { KafkaModule } from '../../kafka/kafka.module';

@Module({
  imports: [
    PrismaModule,
    KafkaModule,
    BullModule.registerQueue({
      name: 'alerts-queue',
    }),
  ],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsProcessor],
  exports: [AlertsService],
})
export class AlertsModule {}
