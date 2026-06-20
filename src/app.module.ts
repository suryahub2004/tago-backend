import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LastActiveInterceptor } from './common/interceptors/last-active.interceptor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { InfluxDBModule } from './modules/influxdb/influxdb.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { AdminModule } from './modules/admin/admin.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { FamilyModule } from './modules/family/family.module';
import { ShopModule } from './modules/shop/shop.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BullModule } from '@nestjs/bull';
import { KafkaModule } from './kafka/kafka.module';
import { AiCoachModule } from './modules/ai-coach/ai-coach.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { MeditationModule } from './modules/meditation/meditation.module';
import { BroadcastModule } from './modules/broadcast/broadcast.module';
import { SupportModule } from './modules/support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
    InfluxDBModule,
    AuthModule,
    UsersModule,
    DevicesModule,
    VitalsModule,
    AdminModule,
    AlertsModule,
    FamilyModule,
    ShopModule,
    NotificationsModule,
    KafkaModule,
    AiCoachModule,
    WorkoutModule,
    MeditationModule,
    BroadcastModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LastActiveInterceptor,
    },
  ],
})
export class AppModule {}
