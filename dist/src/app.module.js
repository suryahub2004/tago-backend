"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const last_active_interceptor_1 = require("./common/interceptors/last-active.interceptor");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./database/prisma/prisma.module");
const redis_module_1 = require("./modules/redis/redis.module");
const influxdb_module_1 = require("./modules/influxdb/influxdb.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const devices_module_1 = require("./modules/devices/devices.module");
const vitals_module_1 = require("./modules/vitals/vitals.module");
const admin_module_1 = require("./modules/admin/admin.module");
const alerts_module_1 = require("./modules/alerts/alerts.module");
const family_module_1 = require("./modules/family/family.module");
const shop_module_1 = require("./modules/shop/shop.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const bull_1 = require("@nestjs/bull");
const kafka_module_1 = require("./kafka/kafka.module");
const ai_coach_module_1 = require("./modules/ai-coach/ai-coach.module");
const workout_module_1 = require("./modules/workout/workout.module");
const meditation_module_1 = require("./modules/meditation/meditation.module");
const broadcast_module_1 = require("./modules/broadcast/broadcast.module");
const support_module_1 = require("./modules/support/support.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    redis: {
                        host: configService.get('REDIS_HOST') || 'localhost',
                        port: configService.get('REDIS_PORT') || 6379,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            influxdb_module_1.InfluxDBModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            devices_module_1.DevicesModule,
            vitals_module_1.VitalsModule,
            admin_module_1.AdminModule,
            alerts_module_1.AlertsModule,
            family_module_1.FamilyModule,
            shop_module_1.ShopModule,
            notifications_module_1.NotificationsModule,
            kafka_module_1.KafkaModule,
            ai_coach_module_1.AiCoachModule,
            workout_module_1.WorkoutModule,
            meditation_module_1.MeditationModule,
            broadcast_module_1.BroadcastModule,
            support_module_1.SupportModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: last_active_interceptor_1.LastActiveInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map