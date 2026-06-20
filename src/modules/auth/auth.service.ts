import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { KAFKA_TOPICS } from '../../kafka/topics';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private kafkaProducer: KafkaProducer,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
      },
    });

    // Always create a HealthProfile record on registration so that
    // GET /users/me always returns a non-null healthProfile object.
    // Without this, SmartVitalUser.fromJson defaults onboardingComplete
    // to false on every sign-in, redirecting users to onboarding forever.
    await this.prisma.healthProfile.create({
      data: {
        userId: user.id,
        onboardingComplete: false,
      },
    });

    await this.kafkaProducer.publish(KAFKA_TOPICS.USER_REGISTERED, {
      eventId: uuid(),
      occurredAt: new Date().toISOString(),
      version: '1.0',
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return this.generateTokens(user);
  }

  async checkEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return { available: !user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new ForbiddenException('Account suspended');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  async adminLogin(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new ForbiddenException('Account suspended');

    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new ForbiddenException('Admin access required');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub;
    const redisKey = `refresh:${userId}:${refreshToken}`;
    const exists = await this.redisService.client.get(redisKey);

    if (!exists) {
      throw new UnauthorizedException('Refresh token is invalidated');
    }



    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive)
      throw new ForbiddenException('Account suspended');

    // Revoke old
    await this.redisService.client.del(redisKey);

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    let cursor = '0';
    const keysToDelete: string[] = [];
    do {
      const [nextCursor, keys] = await this.redisService.client.scan(
        cursor,
        'MATCH',
        `refresh:${userId}:*`,
        'COUNT',
        '100',
      );
      cursor = nextCursor;
      keysToDelete.push(...keys);
    } while (cursor !== '0');

    if (keysToDelete.length > 0) {
      await this.redisService.client.del(...keysToDelete);
    }
    return { success: true };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d',
    });

    // Store refresh token in redis with TTL of 30 days
    const ttlSeconds = 30 * 24 * 60 * 60; // 30 days
    await this.redisService.client.setex(
      `refresh:${user.id}:${refreshToken}`,
      ttlSeconds,
      '1',
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }
}
