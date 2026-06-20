import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Query,
  UseGuards,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AiCoachService } from './ai-coach.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-coach')
export class AiCoachController {
  constructor(private readonly aiCoachService: AiCoachService) {}

  @Get('insights')
  getInsights(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not found');
    return this.aiCoachService.getInsights(userId);
  }

  @Post('insights/refresh')
  refreshInsights(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not found');
    return this.aiCoachService.getInsights(userId, true);
  }

  @Post('ask')
  askQuestion(@Req() req: any, @Body() dto: AskQuestionDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not found');
    return this.aiCoachService.askQuestion(userId, dto.question);
  }

  @Get('workout-suggestion')
  getWorkoutSuggestion(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not found');
    return this.aiCoachService.getWorkoutSuggestion(userId);
  }

  @Post('interactions')
  trackInteraction(
    @Req() req: any,
    @Body()
    body: { insightId: string; type: 'thumbs_up' | 'thumbs_down' | 'click' },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not found');
    return this.aiCoachService.trackInteraction(
      userId,
      body.insightId,
      body.type,
    );
  }

  @Post('insights/:id/interact')
  trackInteractionByPath(
    @Req() req: any,
    @Param('id') insightId: string,
    @Body('type') type: 'click' | 'thumbs_up' | 'thumbs_down',
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not found');
    return this.aiCoachService.trackInteraction(userId, insightId, type);
  }

  // --- ADMIN ROUTES ---
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAdminInsights(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '25',
    @Query('category') category?: string,
  ) {
    return this.aiCoachService.getAdminInsightQuality(
      parseInt(page),
      parseInt(limit),
      category,
    );
  }

  @Get('admin/user/:userId/insights')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getUserInsights(@Param('userId') userId: string) {
    return this.aiCoachService.getInsights(userId);
  }
}
