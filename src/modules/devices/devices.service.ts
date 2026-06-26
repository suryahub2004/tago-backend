import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { PairDeviceDto } from './dto/pair-device.dto';
import { UpdateDeviceSettingsDto } from './dto/update-device-settings.dto';
import { UpdateFirmwareDto } from './dto/update-firmware.dto';
import { UpdateDeviceBySerialDto } from './dto/update-device-by-serial.dto';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { KAFKA_TOPICS } from '../../kafka/topics';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DevicesService {
  constructor(
    private prisma: PrismaService,
    private kafkaProducer: KafkaProducer,
  ) {}

  async pairDevice(userId: string, dto: PairDeviceDto) {
    const existing = await this.prisma.device.findUnique({
      where: { deviceSerial: dto.deviceSerial },
    });

    if (existing) {
      if (existing.userId === userId) {
        // Just reactivate if it's the same user
        return this.prisma.device.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      throw new BadRequestException(
        'Device already paired with another account',
      );
    }

    const device = await this.prisma.device.create({
      data: {
        userId,
        deviceSerial: dto.deviceSerial,
        deviceType: dto.deviceType,
        deviceName: dto.deviceName,
        isActive: true,
      },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.kafkaProducer.publish(KAFKA_TOPICS.DEVICE_PAIRED, {
        eventId: uuid(),
        occurredAt: new Date().toISOString(),
        version: '1.0',
        deviceId: device.id,
        userId: user.id,
        userName: user.name,
        deviceType: device.deviceType,
        deviceSerial: device.deviceSerial,
        firmwareVersion: device.firmwareVersion || '1.0.0',
      });
    }

    return device;
  }

  async unpairDevice(userId: string, deviceId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, userId },
    });
    if (!device) throw new NotFoundException('Device not found');

    return this.prisma.device.update({
      where: { id: deviceId },
      data: { isActive: false },
    });
  }

  async adminUnpairDevice(deviceId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });
    if (!device) throw new NotFoundException('Device not found');

    return this.prisma.device.update({
      where: { id: deviceId },
      data: { 
        isActive: false,
        userId: null,
      },
    });
  }

  async adminQueueFirmwareUpdate(deviceId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });
    if (!device) throw new NotFoundException('Device not found');

    return this.prisma.device.update({
      where: { id: deviceId },
      data: { pendingUpdate: true },
    });
  }

  async getMyDevices(userId: string) {
    return this.prisma.device.findMany({
      where: { userId, isActive: true },
      orderBy: { pairedAt: 'desc' },
    });
  }

  async updateSettings(
    userId: string,
    deviceId: string,
    dto: UpdateDeviceSettingsDto,
  ) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, userId },
    });
    if (!device) throw new NotFoundException('Device not found');

    return this.prisma.device.update({
      where: { id: deviceId },
      data: { settings: dto.settings },
    });
  }

  async updateFirmwareAndBattery(
    userId: string,
    deviceId: string,
    dto: UpdateFirmwareDto,
  ) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, userId },
    });
    if (!device) throw new NotFoundException('Device not found');

    const updatedDevice = await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        firmwareVersion: dto.firmwareVersion ?? device.firmwareVersion,
        batteryLevel: dto.batteryLevel ?? device.batteryLevel,
        lastSyncAt: new Date(),
      },
    });

    if (dto.batteryLevel !== undefined && dto.batteryLevel < 20) {
      await this.kafkaProducer.publish(KAFKA_TOPICS.DEVICE_LOW_BATTERY, {
        eventId: uuid(),
        occurredAt: new Date().toISOString(),
        version: '1.0',
        deviceId: updatedDevice.id,
        userId: updatedDevice.userId,
        deviceType: updatedDevice.deviceType,
        batteryLevel: dto.batteryLevel,
        readingsCount: 0,
      });
    }

    return updatedDevice;
  }

  // Admin Methods
  async getAdminDevicesAnalytics() {
    const totalDevices = await this.prisma.device.count();
    const ringCount = await this.prisma.device.count({
      where: { deviceType: 'SMART_RING' },
    });
    const bandCount = await this.prisma.device.count({
      where: { deviceType: 'WHOOP_BAND' },
    });

    const avgBatteryObj = await this.prisma.device.aggregate({
      _avg: { batteryLevel: true },
      where: { isActive: true },
    });

    return {
      totalDevices,
      ringCount,
      bandCount,
      avgBattery: avgBatteryObj._avg.batteryLevel,
    };
  }

  async getFleetHealth() {
    const [lowBattery, offlineDevices, firmwareStats, totalActive] =
      await Promise.all([
        // Devices with battery < 20% and active
        this.prisma.device.count({
          where: { batteryLevel: { lt: 20 }, isActive: true },
        }),
        // Devices not synced in > 48h and still marked active
        this.prisma.device.count({
          where: {
            isActive: true,
            lastSyncAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
          },
        }),
        // Firmware version breakdown
        this.prisma.device.groupBy({
          by: ['firmwareVersion', 'deviceType'],
          _count: { id: true },
          where: { isActive: true },
          orderBy: { _count: { id: 'desc' } },
        }),
        this.prisma.device.count({ where: { isActive: true } }),
      ]);

    // Get latest firmware version per deviceType
    const latestFirmware = await this.prisma.firmwareVersion.findMany({
      where: { isLatest: true },
      select: { deviceType: true, version: true },
    });

    const latestMap = Object.fromEntries(
      latestFirmware.map((f) => [f.deviceType, f.version]),
    );

    // Compute firmware adoption rates
    const firmwareAdoption = firmwareStats.map((row) => ({
      version: row.firmwareVersion ?? 'Unknown',
      deviceType: row.deviceType,
      count: row._count.id,
      isLatest: row.firmwareVersion === latestMap[row.deviceType],
      adoptionRate:
        totalActive > 0 ? Math.round((row._count.id / totalActive) * 100) : 0,
    }));

    return {
      totalActive,
      lowBattery: {
        count: lowBattery,
        percent:
          totalActive > 0 ? Math.round((lowBattery / totalActive) * 100) : 0,
      },
      offline: {
        count: offlineDevices,
        percent:
          totalActive > 0
            ? Math.round((offlineDevices / totalActive) * 100)
            : 0,
      },
      firmwareAdoption,
      latestVersions: latestMap,
    };
  }

  async getAdminDevices(
    page: number,
    limit: number,
    deviceType?: any,
    isActive?: boolean,
    search?: string,
  ) {
    const where: any = {};
    if (deviceType) where.deviceType = deviceType;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { deviceSerial: { contains: search, mode: 'insensitive' } },
        { deviceName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.device.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.device.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkFirmware(userId: string, deviceId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, userId },
    });
    if (!device) throw new NotFoundException('Device not found');

    const pendingUpdate = device.pendingUpdate;

    // Reset pendingUpdate if it was set
    if (pendingUpdate) {
      await this.prisma.device.update({
        where: { id: device.id },
        data: { pendingUpdate: false },
      });
    }

    const latest = await this.prisma.firmwareVersion.findFirst({
      where: { deviceType: device.deviceType, isLatest: true },
      orderBy: { releasedAt: 'desc' },
    });

    if (!latest) {
      return {
        currentVersion: device.firmwareVersion,
        hasUpdate: pendingUpdate,
      };
    }

    return {
      currentVersion: device.firmwareVersion,
      latestVersion: latest.version,
      hasUpdate: pendingUpdate || device.firmwareVersion !== latest.version,
      releaseNotes: latest.releaseNotes,
      releaseDate: latest.releasedAt,
    };
  }

  async getFirmwareFile(version: string) {
    const firmware = await this.prisma.firmwareVersion.findFirst({
      where: { version },
    });
    if (!firmware) throw new NotFoundException('Firmware not found');

    // In a real app, stream from S3. Mocking response for now.
    return {
      url: `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET || 'bucket'}/${firmware.s3Key}`,
    };
  }

  async updateBySerial(
    serial: string,
    userId: string,
    dto: UpdateDeviceBySerialDto,
  ) {
    const device = await this.prisma.device.findFirst({
      where: { deviceSerial: serial, userId },
    });
    if (!device) throw new NotFoundException('Device not found');

    const updated = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        ...dto,
        lastSyncAt: dto.lastSyncAt ? new Date(dto.lastSyncAt) : undefined,
      },
    });

    // Publish Kafka event — dashboard updates device name in real-time
    await this.kafkaProducer.publish(KAFKA_TOPICS.DEVICE_INFO_UPDATED, {
      eventId: uuid(),
      occurredAt: new Date().toISOString(),
      version: '1.0',
      deviceId: device.id,
      userId,
      deviceName: updated.deviceName,
      firmwareVersion: updated.firmwareVersion,
      batteryLevel: updated.batteryLevel,
    });

    return updated;
  }
}
