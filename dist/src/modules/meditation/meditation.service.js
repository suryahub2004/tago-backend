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
exports.MeditationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let MeditationService = class MeditationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSession(userId, dto) {
        const hrvDelta = dto.hrvAfter && dto.hrvBefore ? dto.hrvAfter - dto.hrvBefore : null;
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
        return session;
    }
    async getSessions(userId, filters) {
        const where = { userId };
        if (filters.patternId)
            where.patternId = filters.patternId;
        return this.prisma.meditationSession.findMany({
            where,
            orderBy: { completedAt: 'desc' },
            take: 50,
        });
    }
    async getStats(userId) {
        const sessions = await this.prisma.meditationSession.findMany({
            where: { userId },
            orderBy: { completedAt: 'asc' },
        });
        const streak = {
            current: sessions.length > 0 ? 1 : 0,
            longest: sessions.length > 0 ? 1 : 0,
        };
        let totalMinutes = 0;
        let hrvDeltaSum = 0;
        let hrvDeltaCount = 0;
        let bestHrvDelta = 0;
        const sessionsByCategory = {};
        for (const s of sessions) {
            totalMinutes += Math.floor(s.durationSeconds / 60);
            if (s.hrvDelta) {
                hrvDeltaSum += s.hrvDelta;
                hrvDeltaCount++;
                if (s.hrvDelta > bestHrvDelta)
                    bestHrvDelta = s.hrvDelta;
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
    async getHrvImpact(userId) {
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
};
exports.MeditationService = MeditationService;
exports.MeditationService = MeditationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MeditationService);
//# sourceMappingURL=meditation.service.js.map