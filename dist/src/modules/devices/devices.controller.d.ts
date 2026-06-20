import { DevicesService } from './devices.service';
import { PairDeviceDto } from './dto/pair-device.dto';
import { UpdateDeviceSettingsDto } from './dto/update-device-settings.dto';
import { UpdateFirmwareDto } from './dto/update-firmware.dto';
import { UpdateDeviceBySerialDto } from './dto/update-device-by-serial.dto';
export declare class DevicesController {
    private readonly devicesService;
    constructor(devicesService: DevicesService);
    pairDevice(user: any, dto: PairDeviceDto): Promise<{
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
    unpairDevice(user: any, deviceId: string): Promise<{
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
    getMyDevices(user: any): Promise<{
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
    updateSettings(user: any, deviceId: string, dto: UpdateDeviceSettingsDto): Promise<{
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
    updateFirmware(user: any, deviceId: string, dto: UpdateFirmwareDto): Promise<{
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
    updateBattery(user: any, deviceId: string, batteryLevel: number): Promise<{
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
    checkFirmware(user: any, deviceId: string): Promise<{
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
    updateBySerial(serial: string, dto: UpdateDeviceBySerialDto, user: any): Promise<{
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
    getAdminDevices(page: number, limit: number, deviceType?: any, isActive?: string, search?: string): Promise<{
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
}
