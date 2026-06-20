import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    private redisService;
    constructor(configService: ConfigService, prisma: PrismaService, redisService: RedisService);
    validate(payload: any): Promise<any>;
}
export {};
