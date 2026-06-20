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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VitalsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitalsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let VitalsGateway = VitalsGateway_1 = class VitalsGateway {
    jwtService;
    configService;
    server;
    logger = new common_1.Logger(VitalsGateway_1.name);
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
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
            client.data.user = payload;
            client.data.userId = payload.sub;
            client.join(`user:${payload.sub}`);
            this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);
        }
        catch (e) {
            this.logger.error(`Connection failed: ${e.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleSubscribeFamily(data, client) {
        client.join(`family:${data.familyGroupId}`);
        this.logger.log(`User ${client.data.userId} subscribed to family ${data.familyGroupId}`);
        return { event: 'subscribed', data: { familyGroupId: data.familyGroupId } };
    }
    broadcastLiveVitals(familyGroupId, data) {
        this.server.to(`family:${familyGroupId}`).emit('vital_update', data);
    }
};
exports.VitalsGateway = VitalsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], VitalsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_family'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], VitalsGateway.prototype, "handleSubscribeFamily", null);
exports.VitalsGateway = VitalsGateway = VitalsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/family',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], VitalsGateway);
//# sourceMappingURL=vitals.gateway.js.map