import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { KafkaModule } from '../../kafka/kafka.module';

@Module({
  imports: [PrismaModule, KafkaModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
