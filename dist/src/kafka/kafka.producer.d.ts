import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { KafkaEventBase } from '../types';
export declare class KafkaProducer implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private kafka;
    private producer;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    publish<T extends KafkaEventBase>(topic: string, payload: T, key?: string): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
