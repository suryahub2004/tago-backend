import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateAlertSettingsDto } from './dto/update-alert-settings.dto';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async getMyAlerts(
    userId: string,
    page: number,
    limit: number,
    severity?: any,
    isRead?: boolean,
  ) {
    const where: any = { userId };
    if (severity) where.severity = severity;
    if (isRead !== undefined) where.isRead = isRead;

    const [data, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(userId: string, alertId: string) {
    const alert = await this.prisma.alert.findFirst({
      where: { id: alertId, userId },
    });
    if (!alert) throw new NotFoundException('Alert not found');

    return this.prisma.alert.update({
      where: { id: alertId },
      data: { isRead: true },
    });
  }

  async acknowledgeAlert(userId: string, alertId: string) {
    const alert = await this.prisma.alert.findFirst({
      where: { id: alertId, userId },
    });
    if (!alert) throw new NotFoundException('Alert not found');

    return this.prisma.alert.update({
      where: { id: alertId },
      data: { isAcknowledged: true, acknowledgedAt: new Date(), isRead: true },
    });
  }

  async getSettings(userId: string) {
    // In a real app, this would query a dedicated Settings model or user's JSON settings
    return { thresholds: { hr_high: 130, hr_low: 40, spo2_low: 95 } }; // Mock
  }

  async updateSettings(userId: string, dto: UpdateAlertSettingsDto) {
    return { thresholds: dto.thresholds }; // Mock
  }

  // Admin Methods
  async getAdminOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalToday = await this.prisma.alert.count({
      where: { createdAt: { gte: today } },
    });
    const criticalToday = await this.prisma.alert.count({
      where: { severity: 'CRITICAL', createdAt: { gte: today } },
    });
    const acknowledgedCount = await this.prisma.alert.count({
      where: { isAcknowledged: true, createdAt: { gte: today } },
    });

    return {
      totalToday,
      criticalToday,
      acknowledgedRate:
        totalToday > 0 ? (acknowledgedCount / totalToday) * 100 : 0,
      volumeChart: Array.from({ length: 7 }, () =>
        Math.floor(Math.random() * 50),
      ), // Mock 7d
    };
  }

  async getAdminAlerts(
    page: number,
    limit: number,
    severity?: any,
    userId?: string,
  ) {
    const where: any = {};
    if (severity) where.severity = severity;
    if (userId) where.userId = userId;

    const [data, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
