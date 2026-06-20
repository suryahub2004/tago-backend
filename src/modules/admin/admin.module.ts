import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { InfluxDBModule } from '../influxdb/influxdb.module';

@Module({
  imports: [PrismaModule, RedisModule, InfluxDBModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
