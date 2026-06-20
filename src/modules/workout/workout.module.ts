import { Module } from '@nestjs/common';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { ExerciseLibraryService } from './exercise-library.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkoutController],
  providers: [WorkoutService, ExerciseLibraryService],
})
export class WorkoutModule {}
