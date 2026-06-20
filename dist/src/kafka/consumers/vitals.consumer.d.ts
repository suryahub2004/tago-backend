import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { AdminGateway } from '../../gateways/admin.gateway';
import { VitalsGateway } from '../../gateways/vitals.gateway';
import { PrismaService } from '../../database/prisma/prisma.service';
export declare class VitalsConsumer extends BaseConsumer {
    private readonly adminGateway;
    private readonly vitalsGateway;
    private readonly prisma;
    constructor(adminGateway: AdminGateway, vitalsGateway: VitalsGateway, prisma: PrismaService);
    handleMessage({ topic, message }: EachMessagePayload): Promise<void>;
}
