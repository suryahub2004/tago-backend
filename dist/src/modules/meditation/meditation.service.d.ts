import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { MeditationStatsDto } from './dto/meditation-stats.dto';
export declare class MeditationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createSession(userId: string, dto: CreateSessionDto): Promise<{
        id: string;
        userId: string;
        category: string;
        notes: string | null;
        durationSeconds: number;
        patternId: string;
        patternName: string;
        cyclesCompleted: number;
        hrvBefore: number | null;
        hrvAfter: number | null;
        hrvDelta: number | null;
        breathHoldSeconds: number | null;
        breathHoldCount: number | null;
        completedAt: Date;
    }>;
    getSessions(userId: string, filters: any): Promise<{
        id: string;
        userId: string;
        category: string;
        notes: string | null;
        durationSeconds: number;
        patternId: string;
        patternName: string;
        cyclesCompleted: number;
        hrvBefore: number | null;
        hrvAfter: number | null;
        hrvDelta: number | null;
        breathHoldSeconds: number | null;
        breathHoldCount: number | null;
        completedAt: Date;
    }[]>;
    getStats(userId: string): Promise<MeditationStatsDto>;
    getHrvImpact(userId: string): Promise<{
        date: string;
        hrvDelta: number | null;
    }[]>;
}
