import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto';

import { RedisService } from '../redis/redis.service';
import { InfluxDBService } from '../influxdb/influxdb.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private influxDB: InfluxDBService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        healthProfile: true,
        devices: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async getHealthProfile(userId: string) {
    const profile = await this.prisma.healthProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Health profile not found');
    return profile;
  }

  async updateHealthProfile(userId: string, dto: UpdateHealthProfileDto) {
    return this.prisma.healthProfile.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
  }

  async softDelete(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${userId}@anonymized.com`,
        name: 'Deleted User',
      },
    });
  }

  // Admin Methods
  async getAdminUsers(
    page: number,
    limit: number,
    role?: any,
    deviceType?: any,
    isActive?: boolean,
    search?: string,
  ) {
    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (deviceType) {
      where.devices = { some: { deviceType } };
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdminUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        healthProfile: true,
        devices: true,
        orders: true,
        _count: {
          select: { alerts: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  async hardDelete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateReadinessScore(
    userId: string,
    score: number,
    computedAt: string,
  ) {
    await this.redisService.client.setex(
      `readiness:${userId}`,
      86400, // 24h TTL
      JSON.stringify({ score, computedAt }),
    );
    return { stored: true };
  }

  async getReadinessScore(userId: string) {
    const raw = await this.redisService.client.get(`readiness:${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as { score: number; computedAt: string };
  }

  async getUserApiUsage(userId: string) {
    const currentHour = new Date().getUTCHours();
    const keys = Array.from({ length: 24 }, (_, i) => `rate:${userId}:${i}`);
    const values = await this.redisService.client.mget(...keys);

    const hourlyBreakdown = values.map((v, i) => ({
      hour: i,
      calls: parseInt(v ?? '0'),
    }));

    const lastHourKey = `rate:${userId}:${currentHour}`;
    const lastHour = parseInt(
      (await this.redisService.client.get(lastHourKey)) ?? '0',
    );
    const total24h = hourlyBreakdown.reduce((sum, h) => sum + h.calls, 0);

    return { lastHour, total24h, hourlyBreakdown };
  }

  async getAdminUserVitals(userId: string) {
    // Get latest vitals from InfluxDB (real when token is set, mock fallback)
    const vitals = await this.influxDB.getLatestVitals(userId);
    
    // Get user's devices from Prisma
    const devices = await this.prisma.device.findMany({
      where: { userId, isActive: true },
      orderBy: { lastSyncAt: 'desc' },
    });
    
    // Get readiness score from Redis
    const readinessRaw = await this.redisService.client.get('readiness:' + userId);
    const readiness = readinessRaw ? JSON.parse(readinessRaw) : null;
    
    return { vitals, devices, readiness };
  }
}
