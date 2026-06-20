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
exports.WorkoutService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let WorkoutService = class WorkoutService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPlan(userId, dto) {
        const plan = await this.prisma.$transaction(async (tx) => {
            const p = await tx.workoutPlan.create({
                data: {
                    userId,
                    name: dto.name,
                    description: dto.description,
                    goal: dto.goal,
                    durationWeeks: dto.durationWeeks,
                    startDate: new Date(dto.startDate),
                    isAiGenerated: dto.isAiGenerated,
                    isActive: true,
                },
            });
            for (const day of dto.days) {
                const d = await tx.workoutDay.create({
                    data: {
                        planId: p.id,
                        dayOfWeek: day.dayOfWeek,
                        label: day.label,
                        isRestDay: day.isRestDay,
                        notes: day.notes,
                        sortOrder: day.sortOrder,
                    },
                });
                if (day.exercises && day.exercises.length > 0) {
                    for (const ex of day.exercises) {
                        await tx.workoutExercise.create({
                            data: {
                                dayId: d.id,
                                exerciseId: ex.exerciseId,
                                sets: ex.sets,
                                reps: ex.reps,
                                durationSeconds: ex.durationSeconds,
                                weightKg: ex.weightKg,
                                restSeconds: ex.restSeconds,
                                notes: ex.notes,
                                sortOrder: ex.sortOrder,
                            },
                        });
                    }
                }
            }
            return p;
        });
        return plan;
    }
    async getPlans(userId, filters) {
        const where = { userId };
        if (filters.isActive !== undefined)
            where.isActive = filters.isActive;
        return this.prisma.workoutPlan.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { days: true },
        });
    }
    async getPlan(id) {
        const plan = await this.prisma.workoutPlan.findUnique({
            where: { id },
            include: {
                days: {
                    include: { exercises: true },
                },
            },
        });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return plan;
    }
    async updatePlan(id, dto) {
        return this.prisma.workoutPlan.update({
            where: { id },
            data: dto,
        });
    }
    async activatePlan(userId, id) {
        await this.prisma.$transaction(async (tx) => {
            await tx.workoutPlan.updateMany({
                where: { userId, isActive: true },
                data: { isActive: false },
            });
            await tx.workoutPlan.update({
                where: { id },
                data: { isActive: true },
            });
        });
        return { success: true };
    }
    async deletePlan(id) {
        return this.prisma.workoutPlan.delete({ where: { id } });
    }
    async logWorkout(userId, dto) {
        const log = await this.prisma.workoutLog.create({
            data: {
                userId,
                planId: dto.planId,
                dayId: dto.dayId,
                date: new Date(dto.date),
                completed: dto.completed,
                durationMinutes: dto.durationMinutes,
                perceivedEffort: dto.perceivedEffort,
                notes: dto.notes,
                avgHeartRate: dto.avgHeartRate,
                peakHeartRate: dto.peakHeartRate,
                caloriesBurned: dto.caloriesBurned,
                strain: dto.strain,
                exerciseLogs: dto.exerciseLogs,
            },
        });
        return log;
    }
    async getLogs(userId) {
        return this.prisma.workoutLog.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });
    }
    async getProgress(userId) {
        const [activePlan, logs, allLogs] = await Promise.all([
            this.prisma.workoutPlan.findFirst({
                where: { userId, isActive: true },
                include: { days: true },
            }),
            this.prisma.workoutLog.findMany({
                where: {
                    userId,
                    date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
                orderBy: { date: 'desc' },
            }),
            this.prisma.workoutLog.count({ where: { userId } }),
        ]);
        const scheduledThisWeek = activePlan?.days?.filter(d => !d.isRestDay).length ?? 0;
        const completedThisWeek = logs.filter(l => l.completed).length;
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const nextD = new Date(d);
            nextD.setDate(nextD.getDate() + 1);
            const hasLog = await this.prisma.workoutLog.findFirst({
                where: { userId, date: { gte: d, lt: nextD }, completed: true },
            });
            if (hasLog)
                streak++;
            else if (i > 0)
                break;
        }
        const avgDuration = logs.length > 0
            ? Math.round(logs.reduce((s, l) => s + (l.durationMinutes ?? 0), 0) / logs.length)
            : 0;
        return {
            currentPlan: activePlan
                ? {
                    name: activePlan.name,
                    weekNumber: Math.ceil((Date.now() - new Date(activePlan.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)),
                    completionRate: scheduledThisWeek > 0
                        ? Math.round((completedThisWeek / scheduledThisWeek) * 100)
                        : 0,
                }
                : null,
            thisWeek: {
                scheduled: scheduledThisWeek,
                completed: completedThisWeek,
                missed: Math.max(0, scheduledThisWeek - completedThisWeek),
            },
            streak: { current: streak, longest: streak },
            totalSessions: allLogs,
            avgDuration,
        };
    }
    async getAdminStats() {
        const totalPlans = await this.prisma.workoutPlan.count();
        const activePlans = await this.prisma.workoutPlan.count({
            where: { isActive: true },
        });
        const totalLogs = await this.prisma.workoutLog.count();
        return {
            totalPlans,
            activePlans,
            totalLogs,
        };
    }
    async getAdminPlans(page, limit) {
        const [data, total] = await Promise.all([
            this.prisma.workoutPlan.findMany({
                skip: (page - 1) * limit,
                take: limit,
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.workoutPlan.count(),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.WorkoutService = WorkoutService;
exports.WorkoutService = WorkoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkoutService);
//# sourceMappingURL=workout.service.js.map