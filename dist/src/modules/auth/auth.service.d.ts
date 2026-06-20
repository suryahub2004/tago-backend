import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { KafkaProducer } from '../../kafka/kafka.producer';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private redisService;
    private kafkaProducer;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, redisService: RedisService, kafkaProducer: KafkaProducer);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    checkEmail(email: string): Promise<{
        available: boolean;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    adminLogin(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    private generateTokens;
}
