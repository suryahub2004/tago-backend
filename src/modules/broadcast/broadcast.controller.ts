import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Broadcast')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Controller('admin/broadcast')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post('popup')
  sendPopup(@Body() dto: CreateBroadcastDto, @CurrentUser() user: any) {
    return this.broadcastService.sendPopup(dto, user.id);
  }

  @Get('messages')
  getMessages(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.broadcastService.getMessages(page, limit);
  }

  @Get('messages/:id')
  getMessage(@Param('id') id: string) {
    return this.broadcastService.getMessage(id);
  }
}
