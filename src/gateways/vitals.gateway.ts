import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/family',
})
export class VitalsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VitalsGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
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

      client.data.user = payload;
      client.data.userId = payload.sub;

      // Join user's personal room
      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (e) {
      this.logger.error(`Connection failed: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_family')
  handleSubscribeFamily(
    @MessageBody() data: { familyGroupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // In a real app, verify the user belongs to this family group
    client.join(`family:${data.familyGroupId}`);
    this.logger.log(
      `User ${client.data.userId} subscribed to family ${data.familyGroupId}`,
    );
    return { event: 'subscribed', data: { familyGroupId: data.familyGroupId } };
  }

  // Simulated method to broadcast live vitals to a family group
  broadcastLiveVitals(familyGroupId: string, data: any) {
    this.server.to(`family:${familyGroupId}`).emit('vital_update', data);
  }
}
