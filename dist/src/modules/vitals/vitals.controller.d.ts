import { VitalsService } from './vitals.service';
import { BatchVitalDto } from './dto/batch-vital.dto';
export declare class VitalsController {
    private readonly vitalsService;
    constructor(vitalsService: VitalsService);
    processBatch(user: any, dto: BatchVitalDto): Promise<{
        accepted: number;
        queued: boolean;
    }>;
    getSummary(user: any, period?: string): Promise<{
        avgHr: number;
        avgHrv: number;
        spo2: number;
        skinTemp: number;
        sleepScore: number;
        steps: number;
        calories: number;
        strain: number;
        stress: number;
        battery: number;
        lastActive: string;
        minHr: number;
    } | {
        avgHr: number;
        avgHrv: number;
        spo2: number;
        skinTemp: number;
        sleepScore: number;
        steps: number;
        calories: number;
        strain: number;
        stress: number;
        battery: number;
        minHr: number;
        lastActive?: undefined;
    }>;
    getHistory(user: any, type: string, period?: string): Promise<{
        value: number;
        time: string;
    }[]>;
    getTrends(user: any, metric: string, days: number): Promise<{
        data: {
            value: number;
            time: string;
        }[];
    }>;
    getCorrelations(user: any): Promise<{
        insights: string[];
    }>;
    getReport(user: any, period?: string): Promise<{
        period: "daily" | "weekly";
        label: string;
        generatedAt: string;
        metrics: {
            avgHeartRate: number;
            avgHrv: number;
            hrvTrend: number;
            avgSpo2: number;
            totalSteps: number;
            stepGoal: number;
            stepGoalPct: number;
            totalCalories: number;
            avgStress: number;
            sleepScore: number;
            skinTemp: number;
        };
    }>;
    getReadinessForecast(user: any): Promise<{
        readinessScore: number;
        trend: string;
        explanation: string;
    }>;
    getWellnessSummary(user: any): Promise<{
        summary: any;
    }>;
}
