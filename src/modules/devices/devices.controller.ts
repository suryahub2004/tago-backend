import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { PairDeviceDto } from './dto/pair-device.dto';
import { UpdateDeviceSettingsDto } from './dto/update-device-settings.dto';
import { UpdateFirmwareDto } from './dto/update-firmware.dto';
import { UpdateDeviceBySerialDto } from './dto/update-device-by-serial.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('pair')
  pairDevice(@CurrentUser() user: any, @Body() dto: PairDeviceDto) {
    return this.devicesService.pairDevice(user.id, dto);
  }

  @Delete(':id/unpair')
  unpairDevice(@CurrentUser() user: any, @Param('id') deviceId: string) {
    return this.devicesService.unpairDevice(user.id, deviceId);
  }

  @Get('my-devices')
  getMyDevices(@CurrentUser() user: any) {
    return this.devicesService.getMyDevices(user.id);
  }

  @Patch(':id/settings')
  updateSettings(
    @CurrentUser() user: any,
    @Param('id') deviceId: string,
    @Body() dto: UpdateDeviceSettingsDto,
  ) {
    return this.devicesService.updateSettings(user.id, deviceId, dto);
  }

  @Patch(':id/firmware')
  updateFirmware(
    @CurrentUser() user: any,
    @Param('id') deviceId: string,
    @Body() dto: UpdateFirmwareDto,
  ) {
    return this.devicesService.updateFirmwareAndBattery(user.id, deviceId, dto);
  }

  @Post(':id/battery')
  updateBattery(
    @CurrentUser() user: any,
    @Param('id') deviceId: string,
    @Body('batteryLevel', ParseIntPipe) batteryLevel: number,
  ) {
    return this.devicesService.updateFirmwareAndBattery(user.id, deviceId, {
      batteryLevel,
    });
  }

  @Get(':id/firmware-check')
  checkFirmware(@CurrentUser() user: any, @Param('id') deviceId: string) {
    return this.devicesService.checkFirmware(user.id, deviceId);
  }

  @Get('firmware/:version')
  getFirmwareFile(@Param('version') version: string) {
    return this.devicesService.getFirmwareFile(version);
  }

  @Patch('serial/:serial')
  updateBySerial(
    @Param('serial') serial: string,
    @Body() dto: UpdateDeviceBySerialDto,
    @CurrentUser() user: any,
  ) {
    return this.devicesService.updateBySerial(serial, user.id, dto);
  }

  // --- ADMIN ROUTES ---
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('admin/:id/unpair')
  adminUnpairDevice(@Param('id') deviceId: string) {
    return this.devicesService.adminUnpairDevice(deviceId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('admin/:id/firmware-update')
  adminQueueFirmwareUpdate(@Param('id') deviceId: string) {
    return this.devicesService.adminQueueFirmwareUpdate(deviceId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/analytics')
  getAdminDevicesAnalytics() {
    return this.devicesService.getAdminDevicesAnalytics();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/fleet-health')
  getFleetHealth() {
    return this.devicesService.getFleetHealth();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/list')
  getAdminDevices(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('deviceType') deviceType?: any,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.devicesService.getAdminDevices(
      page,
      limit,
      deviceType,
      activeBool,
      search,
    );
  }
}
