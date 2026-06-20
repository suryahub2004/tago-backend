import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { InfluxDBModule } from '../influxdb/influxdb.module';
import { VitalsGateway } from '../../gateways/vitals.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, InfluxDBModule, JwtModule.register({})],
  controllers: [FamilyController],
  providers: [FamilyService, VitalsGateway],
  exports: [FamilyService],
})
export class FamilyModule {}
