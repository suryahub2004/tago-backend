"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaModule = void 0;
const common_1 = require("@nestjs/common");
const kafka_producer_1 = require("./kafka.producer");
const user_consumer_1 = require("./consumers/user.consumer");
const order_consumer_1 = require("./consumers/order.consumer");
const alert_consumer_1 = require("./consumers/alert.consumer");
const vitals_consumer_1 = require("./consumers/vitals.consumer");
const device_consumer_1 = require("./consumers/device.consumer");
const notification_consumer_1 = require("./consumers/notification.consumer");
const workout_consumer_1 = require("./consumers/workout.consumer");
const meditation_consumer_1 = require("./consumers/meditation.consumer");
const ai_insight_consumer_1 = require("./consumers/ai-insight.consumer");
const admin_gateway_1 = require("../gateways/admin.gateway");
const app_gateway_1 = require("../gateways/app.gateway");
const vitals_gateway_1 = require("../gateways/vitals.gateway");
const prisma_module_1 = require("../database/prisma/prisma.module");
const jwt_1 = require("@nestjs/jwt");
let KafkaModule = class KafkaModule {
};
exports.KafkaModule = KafkaModule;
exports.KafkaModule = KafkaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, jwt_1.JwtModule.register({})],
        providers: [
            kafka_producer_1.KafkaProducer,
            admin_gateway_1.AdminGateway,
            app_gateway_1.AppGateway,
            vitals_gateway_1.VitalsGateway,
            user_consumer_1.UserConsumer,
            order_consumer_1.OrderConsumer,
            alert_consumer_1.AlertConsumer,
            vitals_consumer_1.VitalsConsumer,
            device_consumer_1.DeviceConsumer,
            notification_consumer_1.NotificationConsumer,
            workout_consumer_1.WorkoutConsumer,
            meditation_consumer_1.MeditationConsumer,
            ai_insight_consumer_1.AiInsightConsumer,
        ],
        exports: [kafka_producer_1.KafkaProducer, admin_gateway_1.AdminGateway, app_gateway_1.AppGateway, vitals_gateway_1.VitalsGateway],
    })
], KafkaModule);
//# sourceMappingURL=kafka.module.js.map