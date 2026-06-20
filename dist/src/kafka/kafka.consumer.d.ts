import { OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
export declare abstract class BaseConsumer implements OnModuleInit, OnModuleDestroy {
    protected readonly groupId: string;
    protected readonly topics: string[];
    protected kafka: Kafka;
    protected consumer: Consumer;
    protected readonly logger: Logger;
    constructor(groupId: string, topics: string[]);
    onModuleInit(): Promise<void>;
    abstract handleMessage(payload: EachMessagePayload): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
