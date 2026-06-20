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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInsightConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafka_consumer_1 = require("../kafka.consumer");
const topics_1 = require("../topics");
const admin_gateway_1 = require("../../gateways/admin.gateway");
let AiInsightConsumer = class AiInsightConsumer extends kafka_consumer_1.BaseConsumer {
    adminGateway;
    constructor(adminGateway) {
        super(process.env.KAFKA_GROUP_ID
            ? process.env.KAFKA_GROUP_ID + '-ai'
            : 'sv-consumer-ai', [topics_1.KAFKA_TOPICS.AI_INSIGHT_GENERATED]);
        this.adminGateway = adminGateway;
    }
    async handleMessage({ topic, message }) {
        const payload = JSON.parse(message.value?.toString() || '{}');
        switch (topic) {
            case topics_1.KAFKA_TOPICS.AI_INSIGHT_GENERATED:
                this.adminGateway.emitNewAiInsight(payload);
                break;
        }
    }
};
exports.AiInsightConsumer = AiInsightConsumer;
exports.AiInsightConsumer = AiInsightConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_gateway_1.AdminGateway])
], AiInsightConsumer);
//# sourceMappingURL=ai-insight.consumer.js.map