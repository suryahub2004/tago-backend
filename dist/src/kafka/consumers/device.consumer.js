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
exports.DeviceConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafka_consumer_1 = require("../kafka.consumer");
const topics_1 = require("../topics");
const admin_gateway_1 = require("../../gateways/admin.gateway");
let DeviceConsumer = class DeviceConsumer extends kafka_consumer_1.BaseConsumer {
    adminGateway;
    constructor(adminGateway) {
        super(process.env.KAFKA_GROUP_ID
            ? process.env.KAFKA_GROUP_ID + '-device'
            : 'sv-consumer-device', [
            topics_1.KAFKA_TOPICS.DEVICE_PAIRED,
            topics_1.KAFKA_TOPICS.DEVICE_LOW_BATTERY,
            topics_1.KAFKA_TOPICS.DEVICE_INFO_UPDATED,
        ]);
        this.adminGateway = adminGateway;
    }
    async handleMessage({ topic, message }) {
        const payload = JSON.parse(message.value?.toString() || '{}');
        switch (topic) {
            case topics_1.KAFKA_TOPICS.DEVICE_PAIRED:
                const deviceEvent = payload;
                this.adminGateway.emitNewDevice(deviceEvent);
                this.adminGateway.emitStatsRefresh();
                break;
            case topics_1.KAFKA_TOPICS.DEVICE_LOW_BATTERY:
                break;
            case topics_1.KAFKA_TOPICS.DEVICE_INFO_UPDATED:
                this.adminGateway.emitDeviceUpdated(payload);
                break;
        }
    }
};
exports.DeviceConsumer = DeviceConsumer;
exports.DeviceConsumer = DeviceConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_gateway_1.AdminGateway])
], DeviceConsumer);
//# sourceMappingURL=device.consumer.js.map