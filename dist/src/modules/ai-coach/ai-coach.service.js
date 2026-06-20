"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiCoachService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const claude_service_1 = require("./claude.service");
const vitals_context_service_1 = require("./vitals-context.service");
let AiCoachService = class AiCoachService {
    prisma;
    claudeService;
    vitalsContextService;
    constructor(prisma, claudeService, vitalsContextService) {
        this.prisma = prisma;
        this.claudeService = claudeService;
        this.vitalsContextService = vitalsContextService;
    }
    async getInsights(userId, forceRefresh = false) {
        if (!forceRefresh) {
            const cached = await this.prisma.aiInsightCache.findUnique({
                where: { userId },
            });
            if (cached && cached.expiresAt > new Date()) {
                return {
                    dailyBrief: cached.dailyBrief,
                    readinessMessage: cached.readinessMessage,
                    todayActions: cached.todayActions,
                    insights: cached.insights,
                    workoutSuggestion: cached.workoutSuggestion,
                    isCached: true,
                };
            }
        }
        const context = await this.vitalsContextService.buildContext(userId);
        const newInsights = await this.claudeService.generateInsights(context);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await this.prisma.aiInsightCache.upsert({
            where: { userId },
            update: {
                dailyBrief: newInsights.dailyBrief,
                readinessMessage: newInsights.readinessMessage,
                todayActions: newInsights.todayActions,
                insights: newInsights.insights,
                workoutSuggestion: newInsights.workoutSuggestion,
                generatedAt: new Date(),
                expiresAt,
            },
            create: {
                userId,
                dailyBrief: newInsights.dailyBrief,
                readinessMessage: newInsights.readinessMessage,
                todayActions: newInsights.todayActions,
                insights: newInsights.insights,
                workoutSuggestion: newInsights.workoutSuggestion,
                generatedAt: new Date(),
                expiresAt,
            },
        });
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
        return { ...newInsights, isCached: false };
    }
    async askQuestion(userId, question) {
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
    async getWorkoutSuggestion(userId) {
        const insights = await this.getInsights(userId);
        return insights.workoutSuggestion;
    }
    async getAdminInsights(page, limit) {
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
    async trackInteraction(userId, insightId, type) {
        return this.prisma.aiInsightInteraction.upsert({
            where: {
                insightId_userId_type: { insightId, userId, type },
            },
            update: {},
            create: { insightId, userId, type },
        });
    }
    async getAdminInsightQuality(page, limit, category) {
        const where = {};
        if (category)
            where.category = category;
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
                if (i.type === 'thumbs_up')
                    thumbsUp++;
                if (i.type === 'thumbs_down')
                    thumbsDown++;
                if (i.type === 'click')
                    clicks++;
            }
            const totalVotes = thumbsUp + thumbsDown;
            const qualityScore = totalVotes > 0 ? Math.round((thumbsUp / totalVotes) * 100) : 0;
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
};
exports.AiCoachService = AiCoachService;
exports.AiCoachService = AiCoachService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        claude_service_1.ClaudeService,
        vitals_context_service_1.VitalsContextService])
], AiCoachService);
//# sourceMappingURL=ai-coach.service.js.map