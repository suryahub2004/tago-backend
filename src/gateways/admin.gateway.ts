import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma/prisma.service';
import {
  UserRegisteredEvent,
  OrderCreatedEvent,
  OrderStatusChangedEvent,
  AlertTriggeredEvent,
  DeviceSyncedEvent,
  DevicePairedEvent,
} from '../types';

@WebSocketGateway({
  namespace: '/admin',
  cors: { origin: process.env.WEB_URL || 'http://localhost:3000' },
})
export class AdminGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      let token = client.handshake.auth?.token;

      if (!token && authHeader) {
        token = authHeader.split(' ')[1];
      }

      if (!token) {
        throw new Error('No authorization token found');
      }

      const payload = this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ||
          'access-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('User not found or not an admin');
      }

      client.data.adminId = payload.sub;
      console.log(
        `Admin client connected: ${client.id} (Admin: ${payload.sub})`,
      );
    } catch (e) {
      console.log(`Admin connection failed: ${(e as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Admin client disconnected: ${client.id}`);
  }

  emitNewUser(payload: UserRegisteredEvent) {
    this.server.emit('new_user', payload);
  }

  emitNewOrder(payload: OrderCreatedEvent) {
    this.server.emit('new_order', payload);
  }

  emitOrderUpdated(payload: OrderStatusChangedEvent) {
    this.server.emit('order_updated', payload);
  }

  emitVitalsAnomaly(payload: any) {
    this.server.emit('vitals_anomaly', payload);
  }

  emitNewWorkoutPlan(payload: any) {
    this.server.emit('new_workout_plan', payload);
  }

  emitWorkoutLogged(payload: any) {
    this.server.emit('workout_logged', payload);
  }

  emitMeditationCompleted(payload: any) {
    this.server.emit('meditation_completed', payload);
  }

  emitNewAiInsight(payload: any) {
    this.server.emit('new_ai_insight', payload);
  }

  emitCriticalAlert(payload: AlertTriggeredEvent) {
    this.server.emit('critical_alert', payload);
  }

  emitDeviceSynced(payload: DeviceSyncedEvent) {
    this.server.emit('device_synced', payload);
  }

  emitNewDevice(payload: DevicePairedEvent) {
    this.server.emit('new_device', payload);
  }

  emitDeviceUpdated(payload: any) {
    this.server.emit('device_updated', payload);
  }

  emitUserUpdated(data: { userId: string }) {
    this.server.emit('user_updated', data);
  }

  // Stats refresh signal — dashboard re-fetches overview on this event
  emitStatsRefresh() {
    this.server.emit('stats_refresh', { ts: new Date().toISOString() });
  }
}
