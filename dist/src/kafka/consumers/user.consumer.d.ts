import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { AdminGateway } from '../../gateways/admin.gateway';
import { KafkaProducer } from '../kafka.producer';
export declare class UserConsumer extends BaseConsumer {
    private readonly adminGateway;
    private readonly kafkaProducer;
    constructor(adminGateway: AdminGateway, kafkaProducer: KafkaProducer);
    handleMessage({ topic, message }: EachMessagePayload): Promise<void>;
}
