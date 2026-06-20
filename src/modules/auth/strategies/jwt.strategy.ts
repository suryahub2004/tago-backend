import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') || 'access-secret',
    });
  }

  async validate(payload: any) {
    const cacheKey = 'user:' + payload.sub;
    const cached = await this.redisService.client.get(cacheKey);

    if (cached) {
      const cachedUser = JSON.parse(cached);
      if (!cachedUser.isActive) {
        throw new UnauthorizedException('Account is suspended');
      }
      return cachedUser;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is suspended');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    await this.redisService.client.setex(
      cacheKey,
      300,
      JSON.stringify(safeUser),
    );

    return safeUser;
  }
}
