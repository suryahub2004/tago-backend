import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { ExerciseLibraryService } from './exercise-library.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateLogDto } from './dto/create-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Workout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workout')
export class WorkoutController {
  constructor(
    private readonly workoutService: WorkoutService,
    private readonly exerciseLibrary: ExerciseLibraryService,
  ) {}

  @Get('exercises')
  getExercises(@Query() query: any) {
    return this.exerciseLibrary.getExercises(query);
  }

  @Get('exercises/:id')
  getExercise(@Param('id') id: string) {
    return this.exerciseLibrary.getExercise(id);
  }

  @Post('exercises')
  createCustomExercise(@Body() data: any, @CurrentUser() user: any) {
    return this.exerciseLibrary.createCustomExercise({ ...data, userId: user.id });
  }

  @Get('plans')
  getPlans(@CurrentUser() user: any, @Query() query: any) {
    return this.workoutService.getPlans(user.id, query);
  }

  @Post('plans')
  createPlan(@CurrentUser() user: any, @Body() dto: CreatePlanDto) {
    return this.workoutService.createPlan(user.id, dto);
  }

  @Get('plans/:id')
  getPlan(@Param('id') id: string) {
    return this.workoutService.getPlan(id);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.workoutService.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.workoutService.deletePlan(id);
  }

  @Patch('plans/:id/activate')
  activatePlan(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workoutService.activatePlan(user.id, id);
  }

  @Post('logs')
  logWorkout(@CurrentUser() user: any, @Body() dto: CreateLogDto) {
    return this.workoutService.logWorkout(user.id, dto);
  }

  @Get('logs')
  getLogs(@CurrentUser() user: any) {
    return this.workoutService.getLogs(user.id);
  }

  @Get('progress')
  getProgress(@CurrentUser() user: any) {
    return this.workoutService.getProgress(user.id);
  }

  // --- ADMIN ROUTES (require ADMIN or SUPER_ADMIN role) ---
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/stats')
  getAdminStats() {
    return this.workoutService.getAdminStats();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/user/:userId/logs')
  getUserWorkoutLogs(@Param('userId') userId: string) {
    return this.workoutService.getLogs(userId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/plans')
  getAdminPlans(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '25',
  ) {
    return this.workoutService.getAdminPlans(parseInt(page), parseInt(limit));
  }
}
