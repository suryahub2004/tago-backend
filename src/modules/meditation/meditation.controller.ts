import { Controller, Get, Post, Body, Req, Query, Param } from '@nestjs/common';
import { MeditationService } from './meditation.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('meditation')
export class MeditationController {
  constructor(private readonly meditationService: MeditationService) {}

  @Post('sessions')
  createSession(@Req() req: any, @Body() dto: CreateSessionDto) {
    const userId = req.user?.id || 'demo-user-id';
    return this.meditationService.createSession(userId, dto);
  }

  @Get('sessions')
  getSessions(@Req() req: any, @Query() query: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.meditationService.getSessions(userId, query);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.meditationService.getStats(userId);
  }

  @Get('hrv-impact')
  getHrvImpact(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.meditationService.getHrvImpact(userId);
  }

  @Get('admin/user/:userId/sessions')
  getUserSessions(@Param('userId') userId: string) {
    return this.meditationService.getSessions(userId, {});
  }
}
