import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma/prisma.service';
import { UserRegisteredEvent, OrderCreatedEvent, OrderStatusChangedEvent, AlertTriggeredEvent, DeviceSyncedEvent, DevicePairedEvent } from '../types';
export declare class AdminGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    private readonly prisma;
    server: Server;
    constructor(jwtService: JwtService, configService: ConfigService, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    emitNewUser(payload: UserRegisteredEvent): void;
    emitNewOrder(payload: OrderCreatedEvent): void;
    emitOrderUpdated(payload: OrderStatusChangedEvent): void;
    emitVitalsAnomaly(payload: any): void;
    emitNewWorkoutPlan(payload: any): void;
    emitWorkoutLogged(payload: any): void;
    emitMeditationCompleted(payload: any): void;
    emitNewAiInsight(payload: any): void;
    emitCriticalAlert(payload: AlertTriggeredEvent): void;
    emitDeviceSynced(payload: DeviceSyncedEvent): void;
    emitNewDevice(payload: DevicePairedEvent): void;
    emitDeviceUpdated(payload: any): void;
    emitUserUpdated(data: {
        userId: string;
    }): void;
    emitStatsRefresh(): void;
}
