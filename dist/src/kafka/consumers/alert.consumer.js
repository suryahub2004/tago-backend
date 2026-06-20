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
exports.AlertConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafka_consumer_1 = require("../kafka.consumer");
const topics_1 = require("../topics");
const admin_gateway_1 = require("../../gateways/admin.gateway");
let AlertConsumer = class AlertConsumer extends kafka_consumer_1.BaseConsumer {
    adminGateway;
    constructor(adminGateway) {
        super(process.env.KAFKA_GROUP_ID
            ? process.env.KAFKA_GROUP_ID + '-alert'
            : 'sv-consumer-alert', [topics_1.KAFKA_TOPICS.ALERT_TRIGGERED]);
        this.adminGateway = adminGateway;
    }
    async handleMessage({ topic, message }) {
        const payload = JSON.parse(message.value?.toString() || '{}');
        if (topic === topics_1.KAFKA_TOPICS.ALERT_TRIGGERED) {
            const alertEvent = payload;
            if (alertEvent.severity === 'CRITICAL') {
                this.adminGateway.emitCriticalAlert(alertEvent);
            }
        }
    }
};
exports.AlertConsumer = AlertConsumer;
exports.AlertConsumer = AlertConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_gateway_1.AdminGateway])
], AlertConsumer);
//# sourceMappingURL=alert.consumer.js.map