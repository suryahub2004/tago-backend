import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { BatchVitalDto } from './dto/batch-vital.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Vitals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vitals')
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post('batch')
  processBatch(@CurrentUser() user: any, @Body() dto: BatchVitalDto) {
    return this.vitalsService.processBatch(user.id, dto);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: any, @Query('period') period?: string) {
    return this.vitalsService.getSummary(user.id, period);
  }

  @Get('history/:type')
  getHistory(
    @CurrentUser() user: any,
    @Param('type') type: string,
    @Query('period') period?: string,
  ) {
    return this.vitalsService.getHistory(user.id, type, period);
  }

  @Get('trends')
  getTrends(
    @CurrentUser() user: any,
    @Query('metric') metric: string,
    @Query('days') days: number,
  ) {
    return this.vitalsService.getTrends(user.id, metric, days);
  }

  @Get('correlations')
  getCorrelations(@CurrentUser() user: any) {
    return this.vitalsService.getCorrelations(user.id);
  }

  @Get('report')
  getReport(
    @CurrentUser() user: any,
    @Query('period') period?: string,
  ) {
    const p = period === 'weekly' ? 'weekly' : 'daily';
    return this.vitalsService.getReport(user.id, p);
  }

  @Get('readiness-forecast')
  getReadinessForecast(@CurrentUser() user: any) {
    return this.vitalsService.getReadinessForecast(user.id);
  }

  @Get('wellness-summary')
  getWellnessSummary(@CurrentUser() user: any) {
    return this.vitalsService.getWellnessSummary(user.id);
  }
}
