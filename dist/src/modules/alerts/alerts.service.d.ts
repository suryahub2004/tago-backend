import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateAlertSettingsDto } from './dto/update-alert-settings.dto';
export declare class AlertsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyAlerts(userId: string, page: number, limit: number, severity?: any, isRead?: boolean): Promise<{
        data: {
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
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markAsRead(userId: string, alertId: string): Promise<{
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
    }>;
    acknowledgeAlert(userId: string, alertId: string): Promise<{
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
    }>;
    getSettings(userId: string): Promise<{
        thresholds: {
            hr_high: number;
            hr_low: number;
            spo2_low: number;
        };
    }>;
    updateSettings(userId: string, dto: UpdateAlertSettingsDto): Promise<{
        thresholds: Record<string, number> | undefined;
    }>;
    getAdminOverview(): Promise<{
        totalToday: number;
        criticalToday: number;
        acknowledgedRate: number;
        volumeChart: number[];
    }>;
    getAdminAlerts(page: number, limit: number, severity?: any, userId?: string): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
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
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
