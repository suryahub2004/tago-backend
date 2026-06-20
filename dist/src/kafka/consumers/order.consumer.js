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
exports.OrderConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafka_consumer_1 = require("../kafka.consumer");
const topics_1 = require("../topics");
const admin_gateway_1 = require("../../gateways/admin.gateway");
let OrderConsumer = class OrderConsumer extends kafka_consumer_1.BaseConsumer {
    adminGateway;
    constructor(adminGateway) {
        super(process.env.KAFKA_GROUP_ID
            ? process.env.KAFKA_GROUP_ID + '-order'
            : 'sv-consumer-order', [topics_1.KAFKA_TOPICS.ORDER_CREATED, topics_1.KAFKA_TOPICS.ORDER_STATUS_UPDATED]);
        this.adminGateway = adminGateway;
    }
    async handleMessage({ topic, message }) {
        const payload = JSON.parse(message.value?.toString() || '{}');
        switch (topic) {
            case topics_1.KAFKA_TOPICS.ORDER_CREATED:
                const orderEvent = payload;
                this.adminGateway.emitNewOrder(orderEvent);
                this.adminGateway.emitStatsRefresh();
                break;
            case topics_1.KAFKA_TOPICS.ORDER_STATUS_UPDATED:
                const statusEvent = payload;
                this.adminGateway.emitOrderUpdated(statusEvent);
                break;
        }
    }
};
exports.OrderConsumer = OrderConsumer;
exports.OrderConsumer = OrderConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_gateway_1.AdminGateway])
], OrderConsumer);
//# sourceMappingURL=order.consumer.js.map