import type { Job } from 'bull';
import { PrismaService } from '../../database/prisma/prisma.service';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { AdminGateway } from '../../gateways/admin.gateway';
import { AppGateway } from '../../gateways/app.gateway';
export declare class AlertsProcessor {
    private prisma;
    private kafkaProducer;
    private adminGateway;
    private appGateway;
    private readonly logger;
    constructor(prisma: PrismaService, kafkaProducer: KafkaProducer, adminGateway: AdminGateway, appGateway: AppGateway);
    handleProcessAlerts(job: Job<any>): Promise<any>;
}
