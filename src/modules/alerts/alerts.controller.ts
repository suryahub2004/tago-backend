import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { UpdateAlertSettingsDto } from './dto/update-alert-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getMyAlerts(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('severity') severity?: any,
    @Query('isRead') isRead?: string,
  ) {
    const isReadBool = isRead !== undefined ? isRead === 'true' : undefined;
    return this.alertsService.getMyAlerts(
      user.id,
      page,
      limit,
      severity,
      isReadBool,
    );
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.alertsService.markAsRead(user.id, id);
  }

  @Patch(':id/acknowledge')
  acknowledgeAlert(@CurrentUser() user: any, @Param('id') id: string) {
    return this.alertsService.acknowledgeAlert(user.id, id);
  }

  @Get('settings')
  getSettings(@CurrentUser() user: any) {
    return this.alertsService.getSettings(user.id);
  }

  @Patch('settings')
  updateSettings(
    @CurrentUser() user: any,
    @Body() dto: UpdateAlertSettingsDto,
  ) {
    return this.alertsService.updateSettings(user.id, dto);
  }

  // --- ADMIN ROUTES ---
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/overview')
  getAdminOverview() {
    return this.alertsService.getAdminOverview();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/list')
  getAdminAlerts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('severity') severity?: any,
    @Query('userId') userId?: string,
  ) {
    return this.alertsService.getAdminAlerts(page, limit, severity, userId);
  }
}
