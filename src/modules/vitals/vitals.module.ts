import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VitalsService } from './vitals.service';
import { VitalsController } from './vitals.controller';
import { VitalsProcessor } from './vitals.processor';
import { InfluxDBModule } from '../influxdb/influxdb.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'vitals-queue' }),
    InfluxDBModule,
    RedisModule,
  ],
  controllers: [VitalsController],
  providers: [VitalsService, VitalsProcessor],
  exports: [VitalsService],
})
export class VitalsModule {}
