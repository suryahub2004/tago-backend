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
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Family')
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('group')
  getMyGroup(@CurrentUser() user: any) {
    return this.familyService.getMyGroup(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('members')
  async getMyMembers(@CurrentUser() user: any) {
    const group = await this.familyService.getMyGroup(user.id);
    return group?.members || [];
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('invite')
  inviteMember(@CurrentUser() user: any, @Body() dto: InviteMemberDto) {
    return this.familyService.inviteMember(user.id, dto);
  }

  // Public endpoint for token validation
  @Get('invite/:token')
  validateInvite(@Param('token') token: string) {
    return this.familyService.validateInvite(token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('invite/:token/accept')
  acceptInvite(@CurrentUser() user: any, @Param('token') token: string) {
    return this.familyService.acceptInvite(token, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('members/:id')
  removeMember(@CurrentUser() user: any, @Param('id') memberId: string) {
    return this.familyService.removeMember(user.id, memberId);
  }

  // updatePermission removed in V4

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('members/:id/status')
  getMemberStatus(@CurrentUser() user: any, @Param('id') memberId: string) {
    return this.familyService.getMemberStatus(user.id, memberId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('invites/pending')
  getPendingInvites(@CurrentUser() user: any) {
    return this.familyService.getPendingInvites(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('invites/:inviteId')
  cancelInvite(@CurrentUser() user: any, @Param('inviteId') inviteId: string) {
    return this.familyService.cancelInvite(user.id, inviteId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('members/:id/permissions')
  updateMemberPermissions(
    @CurrentUser() user: any,
    @Param('id') memberId: string,
    @Body() permissions: any,
  ) {
    return this.familyService.updateMemberPermissions(
      user.id,
      memberId,
      permissions,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('members/:id/shared-vitals')
  getSharedVitals(@CurrentUser() user: any, @Param('id') memberId: string) {
    return this.familyService.getSharedVitals(memberId, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('groups/:id/challenge')
  getFamilyChallenge(@CurrentUser() user: any, @Param('id') groupId: string) {
    return this.familyService.getFamilyChallenge(groupId, user.id);
  }

  // --- ADMIN ROUTES ---
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/list')
  getAdminFamilyGroups(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.familyService.getAdminFamilyGroups(page, limit);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/:id')
  getAdminFamilyGroupDetail(@Param('id') id: string) {
    return this.familyService.getAdminFamilyGroupDetail(id);
  }
}
