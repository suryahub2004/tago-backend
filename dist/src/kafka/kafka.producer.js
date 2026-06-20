"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KafkaProducer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducer = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
const prisma_service_1 = require("../database/prisma/prisma.service");
let KafkaProducer = KafkaProducer_1 = class KafkaProducer {
    prisma;
    kafka;
    producer;
    logger = new common_1.Logger(KafkaProducer_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        this.kafka = new kafkajs_1.Kafka({
            clientId: process.env.KAFKA_CLIENT_ID || 'smartvital-api',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });
        this.producer = this.kafka.producer({
            allowAutoTopicCreation: true,
            transactionTimeout: 30000,
        });
        try {
            await this.producer.connect();
            this.logger.log('Kafka producer connected');
        }
        catch (e) {
            this.logger.error('Failed to connect Kafka producer', e);
        }
    }
    async publish(topic, payload, key) {
        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key: key ?? payload.eventId,
                        value: JSON.stringify(payload),
                        headers: {
                            version: payload.version,
                            occurredAt: payload.occurredAt,
                        },
                    },
                ],
            });
            this.prisma.kafkaEventLog
                .create({
                data: {
                    topic,
                    key: key ?? payload.eventId,
                    payload: payload,
                    userId: payload.userId || null,
                },
            })
                .catch((e) => this.logger.error('Failed to write KafkaEventLog', e));
        }
        catch (e) {
            this.logger.error(`Failed to publish event to topic ${topic}`, e);
        }
    }
    async onModuleDestroy() {
        await this.producer.disconnect();
    }
};
exports.KafkaProducer = KafkaProducer;
exports.KafkaProducer = KafkaProducer = KafkaProducer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KafkaProducer);
//# sourceMappingURL=kafka.producer.js.map