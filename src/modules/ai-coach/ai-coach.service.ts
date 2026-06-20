import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ClaudeService } from './claude.service';
import { VitalsContextService } from './vitals-context.service';
import { AiCoachResponseDto, WorkoutSuggestionDto } from './dto/ai-insight.dto';

@Injectable()
export class AiCoachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly claudeService: ClaudeService,
    private readonly vitalsContextService: VitalsContextService,
  ) {}

  async getInsights(
    userId: string,
    forceRefresh = false,
  ): Promise<AiCoachResponseDto & { isCached: boolean }> {
    if (!forceRefresh) {
      const cached = await this.prisma.aiInsightCache.findUnique({
        where: { userId },
      });
      if (cached && cached.expiresAt > new Date()) {
        return {
          dailyBrief: cached.dailyBrief,
          readinessMessage: cached.readinessMessage,
          todayActions: cached.todayActions,
          insights: cached.insights as any,
          workoutSuggestion: cached.workoutSuggestion as any,
          isCached: true,
        };
      }
    }

    const context = await this.vitalsContextService.buildContext(userId);
    const newInsights = await this.claudeService.generateInsights(context);

    // Save to Cache
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.prisma.aiInsightCache.upsert({
      where: { userId },
      update: {
        dailyBrief: newInsights.dailyBrief,
        readinessMessage: newInsights.readinessMessage,
        todayActions: newInsights.todayActions,
        insights: newInsights.insights as any,
        workoutSuggestion: newInsights.workoutSuggestion as any,
        generatedAt: new Date(),
        expiresAt,
      },
      create: {
        userId,
        dailyBrief: newInsights.dailyBrief,
        readinessMessage: newInsights.readinessMessage,
        todayActions: newInsights.todayActions,
        insights: newInsights.insights as any,
        workoutSuggestion: newInsights.workoutSuggestion as any,
        generatedAt: new Date(),
        expiresAt,
      },
    });

    // Save individual insights for admin history
    // First mark older ones as not current
    await this.prisma.aiInsight.updateMany({
      where: { userId, isCurrent: true },
      data: { isCurrent: false },
    });

    for (const insight of newInsights.insights) {
      await this.prisma.aiInsight.create({
        data: {
          userId,
          category: insight.category,
          title: insight.title,
          body: insight.body,
          priority: insight.priority,
          iconEmoji: insight.iconEmoji,
          deepLinkRoute: insight.deepLinkRoute,
          actionItems: insight.actionItems,
          correlationNote: insight.correlationNote,
          isCurrent: true,
        },
      });
    }

    // In a real app, publish Kafka event AI_INSIGHT_GENERATED here.

    return { ...newInsights, isCached: false };
  }

  async askQuestion(userId: string, question: string): Promise<string> {
    const context = await this.vitalsContextService.buildContext(userId);
    const answer = await this.claudeService.answerQuestion(question, context);

    await this.prisma.aiQuestion.create({
      data: {
        userId,
        question,
        answer,
      },
    });

    return answer;
  }

  async getWorkoutSuggestion(userId: string): Promise<WorkoutSuggestionDto> {
    const insights = await this.getInsights(userId);
    return insights.workoutSuggestion;
  }

  // Admin Methods
  async getAdminInsights(page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.prisma.aiInsight.findMany({
        where: { isCurrent: true },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.aiInsight.count({ where: { isCurrent: true } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async trackInteraction(
    userId: string,
    insightId: string,
    type: 'thumbs_up' | 'thumbs_down' | 'click',
  ) {
    return this.prisma.aiInsightInteraction.upsert({
      where: {
        insightId_userId_type: { insightId, userId, type },
      },
      update: {},
      create: { insightId, userId, type },
    });
  }

  async getAdminInsightQuality(page: number, limit: number, category?: string) {
    const where: any = {};
    if (category) where.category = category;

    const [data, total] = await Promise.all([
      this.prisma.aiInsight.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          interactions: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.aiInsight.count({ where }),
    ]);

    const enhancedData = data.map((insight) => {
      let thumbsUp = 0;
      let thumbsDown = 0;
      let clicks = 0;

      for (const i of insight.interactions) {
        if (i.type === 'thumbs_up') thumbsUp++;
        if (i.type === 'thumbs_down') thumbsDown++;
        if (i.type === 'click') clicks++;
      }

      const totalVotes = thumbsUp + thumbsDown;
      const qualityScore =
        totalVotes > 0 ? Math.round((thumbsUp / totalVotes) * 100) : 0;

      return {
        ...insight,
        thumbsUp,
        thumbsDown,
        clicks,
        qualityScore,
      };
    });

    return {
      data: enhancedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
