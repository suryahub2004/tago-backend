import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { MeditationStatsDto } from './dto/meditation-stats.dto';

@Injectable()
export class MeditationService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const hrvDelta =
      dto.hrvAfter && dto.hrvBefore ? dto.hrvAfter - dto.hrvBefore : null;

    const session = await this.prisma.meditationSession.create({
      data: {
        userId,
        patternId: dto.patternId,
        patternName: dto.patternName,
        category: dto.category,
        durationSeconds: dto.durationSeconds,
        cyclesCompleted: dto.cyclesCompleted,
        hrvBefore: dto.hrvBefore,
        hrvAfter: dto.hrvAfter,
        hrvDelta: hrvDelta,
        breathHoldSeconds: dto.breathHoldSeconds,
        breathHoldCount: dto.breathHoldCount,
        notes: dto.notes,
      },
    });

    // In real app: Publish MEDITATION_SESSION_DONE event

    return session;
  }

  async getSessions(userId: string, filters: any) {
    const where: any = { userId };
    if (filters.patternId) where.patternId = filters.patternId;
    return this.prisma.meditationSession.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      take: 50,
    });
  }

  async getStats(userId: string): Promise<MeditationStatsDto> {
    const sessions = await this.prisma.meditationSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'asc' },
    });

    // Simple streak calc for demo
    const streak = {
      current: sessions.length > 0 ? 1 : 0,
      longest: sessions.length > 0 ? 1 : 0,
    };

    let totalMinutes = 0;
    let hrvDeltaSum = 0;
    let hrvDeltaCount = 0;
    let bestHrvDelta = 0;
    const sessionsByCategory: Record<string, number> = {};

    for (const s of sessions) {
      totalMinutes += Math.floor(s.durationSeconds / 60);
      if (s.hrvDelta) {
        hrvDeltaSum += s.hrvDelta;
        hrvDeltaCount++;
        if (s.hrvDelta > bestHrvDelta) bestHrvDelta = s.hrvDelta;
      }
      sessionsByCategory[s.category] =
        (sessionsByCategory[s.category] || 0) + 1;
    }

    return {
      streak,
      totalSessions: sessions.length,
      totalMinutes,
      avgHrvDelta: hrvDeltaCount > 0 ? hrvDeltaSum / hrvDeltaCount : 0,
      bestHrvDelta,
      sessionsByCategory,
    };
  }

  async getHrvImpact(userId: string) {
    const sessions = await this.prisma.meditationSession.findMany({
      where: { userId, hrvDelta: { not: null } },
      orderBy: { completedAt: 'desc' },
      take: 30,
    });
    return sessions
      .map((s) => ({
        date: s.completedAt.toISOString(),
        hrvDelta: s.hrvDelta,
      }))
      .reverse();
  }
}
