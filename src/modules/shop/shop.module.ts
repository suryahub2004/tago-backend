import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
// KafkaModule is @Global() — it exports KafkaProducer which ShopService injects
// to fire order.created and order.status.updated Kafka events.
import { KafkaModule } from '../../kafka/kafka.module';

@Module({
  imports: [PrismaModule, KafkaModule],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
