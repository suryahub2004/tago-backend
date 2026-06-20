import { MeditationService } from './meditation.service';
import { CreateSessionDto } from './dto/create-session.dto';
export declare class MeditationController {
    private readonly meditationService;
    constructor(meditationService: MeditationService);
    createSession(req: any, dto: CreateSessionDto): Promise<{
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
    getSessions(req: any, query: any): Promise<{
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
    getStats(req: any): Promise<import("./dto/meditation-stats.dto").MeditationStatsDto>;
    getHrvImpact(req: any): Promise<{
        date: string;
        hrvDelta: number | null;
    }[]>;
    getUserSessions(userId: string): Promise<{
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
}
