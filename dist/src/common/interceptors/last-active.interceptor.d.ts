import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../modules/redis/redis.service';
export declare class LastActiveInterceptor implements NestInterceptor {
    private readonly prisma;
    private readonly redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
