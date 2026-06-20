import { PrismaService } from '../../database/prisma/prisma.service';
import { PairDeviceDto } from './dto/pair-device.dto';
import { UpdateDeviceSettingsDto } from './dto/update-device-settings.dto';
import { UpdateFirmwareDto } from './dto/update-firmware.dto';
import { UpdateDeviceBySerialDto } from './dto/update-device-by-serial.dto';
import { KafkaProducer } from '../../kafka/kafka.producer';
export declare class DevicesService {
    private prisma;
    private kafkaProducer;
    constructor(prisma: PrismaService, kafkaProducer: KafkaProducer);
    pairDevice(userId: string, dto: PairDeviceDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        firmwareVersion: string | null;
        deviceSerial: string;
        deviceName: string | null;
        batteryLevel: number | null;
        lastSyncAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        pairedAt: Date;
    }>;
    unpairDevice(userId: string, deviceId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        firmwareVersion: string | null;
        deviceSerial: string;
        deviceName: string | null;
        batteryLevel: number | null;
        lastSyncAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        pairedAt: Date;
    }>;
    getMyDevices(userId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        firmwareVersion: string | null;
        deviceSerial: string;
        deviceName: string | null;
        batteryLevel: number | null;
        lastSyncAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        pairedAt: Date;
    }[]>;
    updateSettings(userId: string, deviceId: string, dto: UpdateDeviceSettingsDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        firmwareVersion: string | null;
        deviceSerial: string;
        deviceName: string | null;
        batteryLevel: number | null;
        lastSyncAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        pairedAt: Date;
    }>;
    updateFirmwareAndBattery(userId: string, deviceId: string, dto: UpdateFirmwareDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        firmwareVersion: string | null;
        deviceSerial: string;
        deviceName: string | null;
        batteryLevel: number | null;
        lastSyncAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        pairedAt: Date;
    }>;
    getAdminDevicesAnalytics(): Promise<{
        totalDevices: number;
        ringCount: number;
        bandCount: number;
        avgBattery: number | null;
    }>;
    getFleetHealth(): Promise<{
        totalActive: number;
        lowBattery: {
            count: number;
            percent: number;
        };
        offline: {
            count: number;
            percent: number;
        };
        firmwareAdoption: {
            version: string;
            deviceType: import(".prisma/client").$Enums.DeviceType;
            count: number;
            isLatest: boolean;
            adoptionRate: number;
        }[];
        latestVersions: {
            [k: string]: string;
        };
    }>;
    getAdminDevices(page: number, limit: number, deviceType?: any, isActive?: boolean, search?: string): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            deviceType: import(".prisma/client").$Enums.DeviceType;
            firmwareVersion: string | null;
            deviceSerial: string;
            deviceName: string | null;
            batteryLevel: number | null;
            lastSyncAt: Date | null;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
            pairedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    checkFirmware(userId: string, deviceId: string): Promise<{
        currentVersion: string | null;
        hasUpdate: boolean;
        latestVersion?: undefined;
        releaseNotes?: undefined;
        releaseDate?: undefined;
    } | {
        currentVersion: string | null;
        latestVersion: string;
        hasUpdate: boolean;
        releaseNotes: string;
        releaseDate: Date;
    }>;
    getFirmwareFile(version: string): Promise<{
        url: string;
    }>;
    updateBySerial(serial: string, userId: string, dto: UpdateDeviceBySerialDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        firmwareVersion: string | null;
        deviceSerial: string;
        deviceName: string | null;
        batteryLevel: number | null;
        lastSyncAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        pairedAt: Date;
    }>;
}
