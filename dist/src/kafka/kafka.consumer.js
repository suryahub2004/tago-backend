"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
class BaseConsumer {
    groupId;
    topics;
    kafka;
    consumer;
    logger = new common_1.Logger(this.constructor.name);
    constructor(groupId, topics) {
        this.groupId = groupId;
        this.topics = topics;
    }
    async onModuleInit() {
        this.kafka = new kafkajs_1.Kafka({
            clientId: process.env.KAFKA_CLIENT_ID || 'smartvital-api',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });
        this.consumer = this.kafka.consumer({ groupId: this.groupId });
        try {
            await this.consumer.connect();
            for (const topic of this.topics) {
                await this.consumer.subscribe({ topic, fromBeginning: false });
            }
            await this.consumer.run({
                eachMessage: async (payload) => {
                    try {
                        await this.handleMessage(payload);
                    }
                    catch (error) {
                        this.logger.error(`Error processing message from topic ${payload.topic}`, error);
                    }
                },
            });
            this.logger.log(`Kafka consumer connected and subscribed to [${this.topics.join(', ')}]`);
        }
        catch (e) {
            this.logger.error('Failed to start Kafka consumer', e);
        }
    }
    async onModuleDestroy() {
        await this.consumer.disconnect();
    }
}
exports.BaseConsumer = BaseConsumer;
//# sourceMappingURL=kafka.consumer.js.map