import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export interface PopupMessagePayload {
    id: string;
    title: string;
    body: string;
    type: string;
    isDismissable: boolean;
    actionLabel?: string;
    actionUrl?: string;
    imageUrl?: string;
}
export interface VitalsAnomalyPayload {
    alertId: string;
    userId: string;
    alertType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    metricValue?: number;
    threshold?: number;
}
export declare class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    emitPopupMessage(message: PopupMessagePayload): void;
    emitVitalsAnomaly(userId: string, payload: VitalsAnomalyPayload): void;
    emitVitalsAnomalyBroadcast(payload: VitalsAnomalyPayload): void;
    emitAppUpdateRequired(version: string, message: string): void;
}
