"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
const kafka_producer_1 = require("../../kafka/kafka.producer");
const topics_1 = require("../../kafka/topics");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    redisService;
    kafkaProducer;
    constructor(prisma, jwtService, configService, redisService, kafkaProducer) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.redisService = redisService;
        this.kafkaProducer = kafkaProducer;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser)
            throw new common_1.BadRequestException('Email already in use');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
                phone: dto.phone,
            },
        });
        await this.prisma.healthProfile.create({
            data: {
                userId: user.id,
                onboardingComplete: false,
            },
        });
        await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.USER_REGISTERED, {
            eventId: (0, uuid_1.v4)(),
            occurredAt: new Date().toISOString(),
            version: '1.0',
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
        return this.generateTokens(user);
    }
    async checkEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        return { available: !user };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || !user.passwordHash)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.isActive)
            throw new common_1.ForbiddenException('Account suspended');
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.generateTokens(user);
    }
    async adminLogin(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || !user.passwordHash)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.isActive)
            throw new common_1.ForbiddenException('Account suspended');
        if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            throw new common_1.ForbiddenException('Admin access required');
        }
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.generateTokens(user);
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret',
            });
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const userId = payload.sub;
        const redisKey = `refresh:${userId}:${refreshToken}`;
        const exists = await this.redisService.client.get(redisKey);
        if (!exists) {
            throw new common_1.UnauthorizedException('Refresh token is invalidated');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.isActive)
            throw new common_1.ForbiddenException('Account suspended');
        await this.redisService.client.del(redisKey);
        return this.generateTokens(user);
    }
    async logout(userId) {
        let cursor = '0';
        const keysToDelete = [];
        do {
            const [nextCursor, keys] = await this.redisService.client.scan(cursor, 'MATCH', `refresh:${userId}:*`, 'COUNT', '100');
            cursor = nextCursor;
            keysToDelete.push(...keys);
        } while (cursor !== '0');
        if (keysToDelete.length > 0) {
            await this.redisService.client.del(...keysToDelete);
        }
        return { success: true };
    }
    async generateTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessSecret = this.configService.get('JWT_ACCESS_SECRET');
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
        if (!accessSecret || !refreshSecret) {
            throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
        }
        const accessToken = this.jwtService.sign(payload, {
            secret: accessSecret,
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '30d',
        });
        const ttlSeconds = 30 * 24 * 60 * 60;
        await this.redisService.client.setex(`refresh:${user.id}:${refreshToken}`, ttlSeconds, '1');
        const { passwordHash, ...userWithoutPassword } = user;
        return {
            accessToken,
            refreshToken,
            user: userWithoutPassword,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService,
        kafka_producer_1.KafkaProducer])
], AuthService);
//# sourceMappingURL=auth.service.js.map