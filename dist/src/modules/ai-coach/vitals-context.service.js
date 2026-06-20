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
exports.VitalsContextService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let VitalsContextService = class VitalsContextService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buildContext(userId) {
        const [user, profile, device] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: userId } }),
            this.prisma.healthProfile.findUnique({ where: { userId } }),
            this.prisma.device.findFirst({ where: { userId, isActive: true } }),
        ]);
        const vitals = {
            avgHR: 68,
            avgHRV: 55,
            avgRestingHR: 52,
            avgSpO2: 98,
            avgSleepScore: 82,
            avgSleepHours: 7.2,
            avgSteps: 8500,
            avgStrain: 12.4,
            avgStress: 35,
        };
        const readiness = 80;
        const hrvBaseline = 50;
        return {
            name: user?.name?.split(' ')[0] || 'User',
            age: profile?.age || 30,
            gender: profile?.gender || 'UNSPECIFIED',
            fitnessLevel: profile?.fitnessLevel || 'BEGINNER',
            fitnessGoals: profile?.fitnessGoal ? [profile.fitnessGoal] : [],
            conditions: profile?.conditions ?? [],
            sleepGoal: profile?.sleepGoal || 8,
            stepsGoal: profile?.stepsGoal || 10000,
            preferredWorkouts: profile?.preferredWorkouts ?? [],
            deviceType: device?.deviceType || 'NONE',
            ...vitals,
            todayReadiness: readiness,
            batteryLevel: device?.batteryLevel || 100,
            hrvBaseline: hrvBaseline,
        };
    }
};
exports.VitalsContextService = VitalsContextService;
exports.VitalsContextService = VitalsContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VitalsContextService);
//# sourceMappingURL=vitals-context.service.js.map