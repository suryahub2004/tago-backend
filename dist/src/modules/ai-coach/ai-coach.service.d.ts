import { PrismaService } from '../../database/prisma/prisma.service';
import { ClaudeService } from './claude.service';
import { VitalsContextService } from './vitals-context.service';
import { AiCoachResponseDto, WorkoutSuggestionDto } from './dto/ai-insight.dto';
export declare class AiCoachService {
    private readonly prisma;
    private readonly claudeService;
    private readonly vitalsContextService;
    constructor(prisma: PrismaService, claudeService: ClaudeService, vitalsContextService: VitalsContextService);
    getInsights(userId: string, forceRefresh?: boolean): Promise<AiCoachResponseDto & {
        isCached: boolean;
    }>;
    askQuestion(userId: string, question: string): Promise<string>;
    getWorkoutSuggestion(userId: string): Promise<WorkoutSuggestionDto>;
    getAdminInsights(page: number, limit: number): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            category: string;
            title: string;
            body: string;
            isCurrent: boolean;
            priority: string;
            iconEmoji: string;
            deepLinkRoute: string | null;
            actionItems: string[];
            correlationNote: string | null;
            vitalSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            profileSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    trackInteraction(userId: string, insightId: string, type: 'thumbs_up' | 'thumbs_down' | 'click'): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        insightId: string;
    }>;
    getAdminInsightQuality(page: number, limit: number, category?: string): Promise<{
        data: {
            thumbsUp: number;
            thumbsDown: number;
            clicks: number;
            qualityScore: number;
            user: {
                id: string;
                email: string;
                name: string;
            };
            interactions: {
                id: string;
                createdAt: Date;
                userId: string;
                type: string;
                insightId: string;
            }[];
            id: string;
            createdAt: Date;
            userId: string;
            category: string;
            title: string;
            body: string;
            isCurrent: boolean;
            priority: string;
            iconEmoji: string;
            deepLinkRoute: string | null;
            actionItems: string[];
            correlationNote: string | null;
            vitalSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            profileSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
