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
var AppGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
let AppGateway = AppGateway_1 = class AppGateway {
    jwtService;
    configService;
    server;
    logger = new common_1.Logger(AppGateway_1.name);
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token?.replace('Bearer ', '');
            if (!token)
                throw new Error('No token provided');
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET') ||
                    'access-secret',
            });
            client.data.userId = payload.sub;
            client.join(`user:${payload.sub}`);
            this.logger.log(`App client connected: ${client.id} (User: ${payload.sub})`);
        }
        catch (e) {
            this.logger.log(`App connection failed: ${e.message}`);
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`App client disconnected: ${client.id}`);
    }
    emitPopupMessage(message) {
        this.server.emit('popup_message', message);
    }
    emitVitalsAnomaly(userId, payload) {
        this.server.to(`user:${userId}`).emit('vitals_anomaly', payload);
        this.logger.log(`Emitted vitals_anomaly to user ${userId}: ${payload.alertType} (${payload.severity})`);
    }
    emitVitalsAnomalyBroadcast(payload) {
        this.server.emit('vitals_anomaly', payload);
    }
    emitAppUpdateRequired(version, message) {
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
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
exports.AppGateway = AppGateway = AppGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/app', cors: { origin: '*' } }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AppGateway);
//# sourceMappingURL=app.gateway.js.map