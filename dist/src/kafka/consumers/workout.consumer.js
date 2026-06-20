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
exports.WorkoutConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafka_consumer_1 = require("../kafka.consumer");
const topics_1 = require("../topics");
const admin_gateway_1 = require("../../gateways/admin.gateway");
let WorkoutConsumer = class WorkoutConsumer extends kafka_consumer_1.BaseConsumer {
    adminGateway;
    constructor(adminGateway) {
        super(process.env.KAFKA_GROUP_ID
            ? process.env.KAFKA_GROUP_ID + '-workout'
            : 'sv-consumer-workout', [
            topics_1.KAFKA_TOPICS.WORKOUT_PLAN_CREATED,
            topics_1.KAFKA_TOPICS.WORKOUT_LOGGED,
            topics_1.KAFKA_TOPICS.WORKOUT_PLAN_COMPLETED,
        ]);
        this.adminGateway = adminGateway;
    }
    async handleMessage({ topic, message }) {
        const payload = JSON.parse(message.value?.toString() || '{}');
        switch (topic) {
            case topics_1.KAFKA_TOPICS.WORKOUT_PLAN_CREATED:
                this.adminGateway.emitNewWorkoutPlan(payload);
                break;
            case topics_1.KAFKA_TOPICS.WORKOUT_LOGGED:
                this.adminGateway.emitWorkoutLogged(payload);
                break;
            case topics_1.KAFKA_TOPICS.WORKOUT_PLAN_COMPLETED:
                break;
        }
    }
};
exports.WorkoutConsumer = WorkoutConsumer;
exports.WorkoutConsumer = WorkoutConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_gateway_1.AdminGateway])
], WorkoutConsumer);
//# sourceMappingURL=workout.consumer.js.map