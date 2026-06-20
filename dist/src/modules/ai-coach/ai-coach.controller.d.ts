import { AiCoachService } from './ai-coach.service';
import { AskQuestionDto } from './dto/ask-question.dto';
export declare class AiCoachController {
    private readonly aiCoachService;
    constructor(aiCoachService: AiCoachService);
    getInsights(req: any): Promise<import("./dto/ai-insight.dto").AiCoachResponseDto & {
        isCached: boolean;
    }>;
    refreshInsights(req: any): Promise<import("./dto/ai-insight.dto").AiCoachResponseDto & {
        isCached: boolean;
    }>;
    askQuestion(req: any, dto: AskQuestionDto): Promise<string>;
    getWorkoutSuggestion(req: any): Promise<import("./dto/ai-insight.dto").WorkoutSuggestionDto>;
    trackInteraction(req: any, body: {
        insightId: string;
        type: 'thumbs_up' | 'thumbs_down' | 'click';
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        insightId: string;
    }>;
    trackInteractionByPath(req: any, insightId: string, type: 'click' | 'thumbs_up' | 'thumbs_down'): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        insightId: string;
    }>;
    getAdminInsights(page?: string, limit?: string, category?: string): Promise<{
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
    getUserInsights(userId: string): Promise<import("./dto/ai-insight.dto").AiCoachResponseDto & {
        isCached: boolean;
    }>;
}
