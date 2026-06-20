import type { Response } from 'express';
import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getOverviewStats(range?: string): Promise<{
        totalUsers: number;
        usersToday: number;
        totalDevices: number;
        ringCount: number;
        bandCount: number;
        activeDevicesLast24h: number;
        totalOrders: number;
        ordersToday: number;
        activeAlerts: number;
        aiInsightsToday: number;
        workoutsThisWeek: number;
        vitalsRecordedToday: number;
        chartData: {
            date: string;
            users: number;
            vitals: number;
            revenue: number;
        }[];
        recentAlerts: ({
            user: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            isAcknowledged: boolean;
            alertType: string;
            severity: import(".prisma/client").$Enums.AlertSeverity;
            message: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
            acknowledgedAt: Date | null;
        })[];
        totalRevenue: number;
        revenueToday: number;
        avgOrderValue: number;
        conversionRate: number;
    }>;
    getSystemHealth(): Promise<{
        api: {
            status: string;
            uptime: number;
            latency: number;
            p95Ms: number;
        };
        database: {
            status: string;
            latency: number;
        };
        redis: {
            status: string;
            usedMemory: string;
            peakMemory: string;
            connectedClients: number;
            totalKeys: number;
        } | {
            status: string;
            error: boolean;
        };
        kafka: {
            status: string;
            activeBrokers: number;
            partitions: number;
            consumerGroups: {
                groupId: string;
                lag: number;
                status: string;
            }[];
        };
        websocket: {
            status: string;
            connectedAdmins: number;
            connectedUsers: number;
        } | {
            status: string;
            error: boolean;
        };
        checkedAt: string;
    }>;
    globalSearch(query: string): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        orders: ({
            user: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            totalAmount: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            discountAmount: number;
            promoCode: string | null;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            paymentId: string | null;
            paymentMethod: string | null;
            trackingNumber: string | null;
            notes: string | null;
            ringSize: string | null;
        })[];
        devices: ({
            user: {
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
    }>;
    getAuditLog(page?: string, limit?: string, userId?: string, topic?: string, from?: string, to?: string): Promise<{
        data: ({
            user: {
                email: string;
                name: string;
            } | null;
        } & {
            id: string;
            userId: string | null;
            topic: string;
            key: string | null;
            payload: import("@prisma/client/runtime/library").JsonValue;
            producedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    exportUsersReport(res: Response): Promise<void>;
    exportRevenueReport(res: Response): Promise<void>;
    exportDevicesReport(res: Response): Promise<void>;
    exportAlertsReport(res: Response): Promise<void>;
    broadcastMessage(body: any, req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getFirmwareVersions(): Promise<{
        id: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        version: string;
        s3Key: string;
        releaseNotes: string;
        isLatest: boolean;
        releasedAt: Date;
    }[]>;
    createFirmwareVersion(body: any): Promise<{
        success: boolean;
    }>;
    updateFirmwareVersion(id: string, isLatest: boolean): Promise<{
        success: boolean;
    }>;
    deleteFirmwareVersion(id: string): Promise<{
        success: boolean;
    }>;
    getKafkaAuditLogs(page?: string, limit?: string): Promise<{
        data: ({
            user: {
                email: string;
                name: string;
            } | null;
        } & {
            id: string;
            userId: string | null;
            topic: string;
            key: string | null;
            payload: import("@prisma/client/runtime/library").JsonValue;
            producedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
