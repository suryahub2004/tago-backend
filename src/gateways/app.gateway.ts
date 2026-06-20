import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

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

@WebSocketGateway({ namespace: '/app', cors: { origin: '*' } })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.replace('Bearer ', '');
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ||
          'access-secret',
      });
      client.data.userId = payload.sub;

      // Join a per-user room so we can target specific users
      client.join(`user:${payload.sub}`);
      this.logger.log(`App client connected: ${client.id} (User: ${payload.sub})`);
    } catch (e) {
      this.logger.log(`App connection failed: ${(e as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`App client disconnected: ${client.id}`);
  }

  /** Broadcast a popup/announcement message to ALL connected app users. */
  emitPopupMessage(message: PopupMessagePayload) {
    this.server.emit('popup_message', message);
  }

  /**
   * Send a vitals anomaly alert to a specific user.
   * The Flutter app listens for `vitals_anomaly` on the `/app` namespace
   * and shows a VitalsAnomalyCard + triggers haptic feedback.
   */
  emitVitalsAnomaly(userId: string, payload: VitalsAnomalyPayload) {
    // Emit to the user's personal room so only they receive it
    this.server.to(`user:${userId}`).emit('vitals_anomaly', payload);
    this.logger.log(
      `Emitted vitals_anomaly to user ${userId}: ${payload.alertType} (${payload.severity})`,
    );
  }

  /** Broadcast a vitals anomaly to ALL connected app users (admin broadcasts). */
  emitVitalsAnomalyBroadcast(payload: VitalsAnomalyPayload) {
    this.server.emit('vitals_anomaly', payload);
  }

  emitAppUpdateRequired(version: string, message: string) {
    this.server.emit('app_update_required', {
      id: `update_${version}`,
      title: 'Update Required',
      body: message,
      type: 'update',
      isDismissable: false,
      actionLabel: 'Update Now',
      actionUrl: 'https://play.google.com/store/apps/details?id=io.smartvital',
    });
  }
}
