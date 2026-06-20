import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WriteApi, QueryApi } from '@influxdata/influxdb-client';
export declare class InfluxDBService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private client;
    writeApi: WriteApi;
    queryApi: QueryApi;
    private readonly logger;
    constructor(configService: ConfigService);
    get bucket(): string;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getLatestVitals(userId: string): Promise<{
        heartRate: number;
        hrv: number;
        spo2: number;
        skinTemp: number;
        sleepScore: number;
        sleepStages: {
            deep: string;
            light: string;
            rem: string;
        };
        steps: number;
        calories: number;
        strain: number;
        stress: number;
        battery: number;
        lastActive: string;
    }>;
}
