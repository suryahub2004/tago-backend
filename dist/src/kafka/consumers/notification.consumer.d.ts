import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
export declare class NotificationConsumer extends BaseConsumer {
    constructor();
    private firebaseAdmin;
    handleMessage({ topic, message }: EachMessagePayload): Promise<void>;
}
