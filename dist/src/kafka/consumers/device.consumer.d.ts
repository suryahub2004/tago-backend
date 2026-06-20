import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { AdminGateway } from '../../gateways/admin.gateway';
export declare class DeviceConsumer extends BaseConsumer {
    private readonly adminGateway;
    constructor(adminGateway: AdminGateway);
    handleMessage({ topic, message }: EachMessagePayload): Promise<void>;
}
