import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class LastActiveInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const startTime = Date.now();

    if (userId) {
      // Fire-and-forget — do not await, never block the request
      this.prisma.user
        .update({
          where: { id: userId },
          data: { lastActiveAt: new Date() },
        })
        .catch(() => {}); // silently fail — non-critical

      // Rate tracking: increment per-user hourly counter in Redis
      const hourKey = `rate:${userId}:${new Date().getUTCHours()}`;
      this.redisService.client
        .incr(hourKey)
        .then(() => {
          this.redisService.client.expire(hourKey, 7200);
        })
        .catch(() => {});
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.redisService.client
          .zadd('metrics:response_times', duration, `${Date.now()}`)
          .catch(() => {});
        this.redisService.client
          .zremrangebyrank('metrics:response_times', 0, -1001)
          .catch(() => {});
      }),
    );
  }
}
