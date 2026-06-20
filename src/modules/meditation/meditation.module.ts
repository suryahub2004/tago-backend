import { Module } from '@nestjs/common';
import { MeditationController } from './meditation.controller';
import { MeditationService } from './meditation.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MeditationController],
  providers: [MeditationService],
})
export class MeditationModule {}
