import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/health-profile')
  getHealthProfile(@CurrentUser() user: any) {
    return this.usersService.getHealthProfile(user.id);
  }

  @Patch('me/health-profile')
  updateHealthProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateHealthProfileDto,
  ) {
    return this.usersService.updateHealthProfile(user.id, dto);
  }

  @Delete('me')
  softDelete(@CurrentUser() user: any) {
    return this.usersService.softDelete(user.id);
  }

  @Post('me/readiness')
  updateMyReadiness(
    @CurrentUser() user: any,
    @Body() body: { score: number; computedAt: string },
  ) {
    return this.usersService.updateReadinessScore(
      user.id,
      body.score,
      body.computedAt,
    );
  }

  // --- ADMIN ROUTES ---
  @Roles(UserRole.SUPER_ADMIN)
  @Get('admin/list')
  getAdminUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('role') role?: UserRole,
    @Query('deviceType') deviceType?: any,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.usersService.getAdminUsers(
      page,
      limit,
      role,
      deviceType,
      activeBool,
      search,
    );
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('admin/export')
  async exportUsers() {
    // Basic CSV mock return for now
    const data = await this.usersService.getAdminUsers(1, 10000); // fetch all
    const csv =
      'id,email,name,role,isActive\n' +
      data.data
        .map((u) => `${u.id},${u.email},${u.name},${u.role},${u.isActive}`)
        .join('\n');
    return csv;
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/:id')
  getAdminUserDetail(@Param('id') id: string) {
    return this.usersService.getAdminUserDetail(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/:id/full-profile')
  getAdminUserVitals(@Param('id') id: string) {
    return this.usersService.getAdminUserVitals(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/:id/readiness')
  getUserReadiness(@Param('id') id: string) {
    return this.usersService.getReadinessScore(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/:id/api-usage')
  async getApiUsage(@Param('id') userId: string) {
    return this.usersService.getUserApiUsage(userId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch('admin/:id/status')
  toggleUserStatus(
    @Param('id') id: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    return this.usersService.toggleUserStatus(id, isActive);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete('admin/:id')
  hardDelete(@Param('id') id: string) {
    return this.usersService.hardDelete(id);
  }
}
