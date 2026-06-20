import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateSimpleTicketDto } from './dto/create-simple-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole, TicketStatus } from '@prisma/client';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  createTicket(@CurrentUser() user: any, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(user.id, dto);
  }

  @Post('ticket')
  createSimpleTicket(@CurrentUser() user: any, @Body() dto: CreateSimpleTicketDto) {
    return this.supportService.createSimpleTicket(user.id, dto);
  }

  @Get('my-tickets')
  getMyTickets(@CurrentUser() user: any) {
    return this.supportService.getMyTickets(user.id);
  }

  @Get('my-tickets/:id')
  getTicketDetail(@CurrentUser() user: any, @Param('id') id: string) {
    return this.supportService.getTicketDetail(user.id, id);
  }

  @Post('my-tickets/:id/reply')
  replyTicketAsUser(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.supportService.replyTicketAsUser(user.id, id, dto);
  }

  // --- ADMIN ROUTES ---
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/list')
  getAdminTickets(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('status') status?: TicketStatus,
    @Query('search') search?: string,
  ) {
    return this.supportService.getAdminTickets(page, limit, status, search);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/:id')
  getAdminTicketDetail(@Param('id') id: string) {
    return this.supportService.getAdminTicketDetail(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('admin/:id/status')
  updateTicketStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
  ) {
    return this.supportService.updateTicketStatus(id, status);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('admin/:id/reply')
  replyTicketAsAdmin(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.supportService.replyTicketAsAdmin(id, admin.id, dto);
  }
}
