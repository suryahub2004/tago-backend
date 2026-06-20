import { Controller, Get, UseGuards, Query, Res, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('stats/overview')
  getOverviewStats(@Query('range') range?: string) {
    let from: Date | undefined;
    let to: Date | undefined;
    
    if (range) {
      to = new Date();
      if (range === '7d') from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      else if (range === '30d') from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      else if (range === '90d') from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      else if (range === 'ytd') {
        from = new Date(new Date().getFullYear(), 0, 1);
      } else if (range === 'all') {
        from = new Date(0);
      }
    }
    
    return this.adminService.getOverviewStats(from, to);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('stats/health')
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('search')
  globalSearch(@Query('q') query: string) {
    return this.adminService.globalSearch(query);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('audit')
  getAuditLog(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '25',
    @Query('userId') userId?: string,
    @Query('topic') topic?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminService.getAuditLog(parseInt(page), parseInt(limit), userId, topic, from, to);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('reports/users')
  async exportUsersReport(@Res() res: Response) {
    const csv = await this.adminService.exportUsersReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users-report.csv"');
    res.send(csv);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('reports/revenue')
  async exportRevenueReport(@Res() res: Response) {
    const csv = await this.adminService.exportRevenueReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.csv"');
    res.send(csv);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('reports/devices')
  async exportDevicesReport(@Res() res: Response) {
    const csv = await this.adminService.exportDevicesReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="devices-report.csv"');
    res.send(csv);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('reports/alerts')
  async exportAlertsReport(@Res() res: Response) {
    const csv = await this.adminService.exportAlertsReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="alerts-report.csv"');
    res.send(csv);
  }

  // --- BROADCAST ---
  @Roles(UserRole.SUPER_ADMIN)
  @Post('broadcast')
  broadcastMessage(@Body() body: any, @Req() req: any) {
    const adminId = req.user.id;
    return this.adminService.broadcastMessage(body, adminId);
  }

  // --- FIRMWARE ---
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('firmware')
  getFirmwareVersions() {
    return this.adminService.getFirmwareVersions();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post('firmware')
  createFirmwareVersion(@Body() body: any) {
    return this.adminService.createFirmwareVersion(body);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch('firmware/:id')
  updateFirmwareVersion(@Param('id') id: string, @Body('isLatest') isLatest: boolean) {
    return this.adminService.updateFirmwareVersion(id, isLatest);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete('firmware/:id')
  deleteFirmwareVersion(@Param('id') id: string) {
    return this.adminService.deleteFirmwareVersion(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('kafka-audit')
  getKafkaAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.adminService.getKafkaAuditLogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50
    );
  }
}
