import { PrismaService } from '../../database/prisma/prisma.service';
export interface HealthContext {
    name: string;
    age: number;
    gender: string;
    fitnessLevel: string;
    fitnessGoals: string[];
    conditions: string[];
    sleepGoal: number;
    stepsGoal: number;
    preferredWorkouts: string[];
    deviceType: string;
    avgHR: number;
    avgHRV: number;
    avgRestingHR: number;
    avgSpO2: number;
    avgSleepScore: number;
    avgSleepHours: number;
    avgSteps: number;
    avgStrain: number;
    avgStress: number;
    todayReadiness: number;
    batteryLevel: number;
    hrvBaseline: number;
}
export declare class VitalsContextService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    buildContext(userId: string): Promise<HealthContext>;
}
