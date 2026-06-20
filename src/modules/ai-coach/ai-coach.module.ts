import { Module } from '@nestjs/common';
import { AiCoachController } from './ai-coach.controller';
import { AiCoachService } from './ai-coach.service';
import { ClaudeService } from './claude.service';
import { VitalsContextService } from './vitals-context.service';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AiCoachController],
  providers: [AiCoachService, ClaudeService, VitalsContextService],
})
export class AiCoachModule {}
