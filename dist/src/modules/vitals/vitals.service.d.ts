import type { Queue } from 'bull';
import { BatchVitalDto } from './dto/batch-vital.dto';
import { InfluxDBService } from '../influxdb/influxdb.service';
import { RedisService } from '../redis/redis.service';
export declare class VitalsService {
    private vitalsQueue;
    private influxDB;
    private redisService;
    private readonly logger;
    constructor(vitalsQueue: Queue, influxDB: InfluxDBService, redisService: RedisService);
    processBatch(userId: string, dto: BatchVitalDto): Promise<{
        accepted: number;
        queued: boolean;
    }>;
    getSummary(userId: string, period?: string): Promise<{
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
    getHistory(userId: string, metric: string, period?: string): Promise<{
        value: number;
        time: string;
    }[]>;
    getReport(userId: string, period?: 'daily' | 'weekly'): Promise<{
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
    getReadinessForecast(userId: string): Promise<{
        readinessScore: number;
        trend: string;
        explanation: string;
    }>;
    getTrends(userId: string, metric: string, days: number): Promise<{
        data: {
            value: number;
            time: string;
        }[];
    }>;
    getCorrelations(userId: string): Promise<{
        insights: string[];
    }>;
    getWellnessSummary(userId: string): Promise<{
        summary: any;
    }>;
}
