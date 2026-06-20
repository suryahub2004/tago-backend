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
exports.AdminGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma/prisma.service");
let AdminGateway = class AdminGateway {
    jwtService;
    configService;
    prisma;
    server;
    constructor(jwtService, configService, prisma) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
    }
    async handleConnection(client) {
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
                secret: this.configService.get('JWT_ACCESS_SECRET') ||
                    'access-secret',
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
                throw new Error('User not found or not an admin');
            }
            client.data.adminId = payload.sub;
            console.log(`Admin client connected: ${client.id} (Admin: ${payload.sub})`);
        }
        catch (e) {
            console.log(`Admin connection failed: ${e.message}`);
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        console.log(`Admin client disconnected: ${client.id}`);
    }
    emitNewUser(payload) {
        this.server.emit('new_user', payload);
    }
    emitNewOrder(payload) {
        this.server.emit('new_order', payload);
    }
    emitOrderUpdated(payload) {
        this.server.emit('order_updated', payload);
    }
    emitVitalsAnomaly(payload) {
        this.server.emit('vitals_anomaly', payload);
    }
    emitNewWorkoutPlan(payload) {
        this.server.emit('new_workout_plan', payload);
    }
    emitWorkoutLogged(payload) {
        this.server.emit('workout_logged', payload);
    }
    emitMeditationCompleted(payload) {
        this.server.emit('meditation_completed', payload);
    }
    emitNewAiInsight(payload) {
        this.server.emit('new_ai_insight', payload);
    }
    emitCriticalAlert(payload) {
        this.server.emit('critical_alert', payload);
    }
    emitDeviceSynced(payload) {
        this.server.emit('device_synced', payload);
    }
    emitNewDevice(payload) {
        this.server.emit('new_device', payload);
    }
    emitDeviceUpdated(payload) {
        this.server.emit('device_updated', payload);
    }
    emitUserUpdated(data) {
        this.server.emit('user_updated', data);
    }
    emitStatsRefresh() {
        this.server.emit('stats_refresh', { ts: new Date().toISOString() });
    }
};
exports.AdminGateway = AdminGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AdminGateway.prototype, "server", void 0);
exports.AdminGateway = AdminGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/admin',
        cors: { origin: process.env.WEB_URL || 'http://localhost:3000' },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], AdminGateway);
//# sourceMappingURL=admin.gateway.js.map