import { DeviceType } from '@prisma/client';
export declare class PairDeviceDto {
    deviceSerial: string;
    deviceType: DeviceType;
    deviceName?: string;
}
