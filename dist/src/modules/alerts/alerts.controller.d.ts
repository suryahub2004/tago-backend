import { AlertsService } from './alerts.service';
import { UpdateAlertSettingsDto } from './dto/update-alert-settings.dto';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    getMyAlerts(user: any, page: number, limit: number, severity?: any, isRead?: string): Promise<{
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
    markAsRead(user: any, id: string): Promise<{
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
    acknowledgeAlert(user: any, id: string): Promise<{
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
    getSettings(user: any): Promise<{
        thresholds: {
            hr_high: number;
            hr_low: number;
            spo2_low: number;
        };
    }>;
    updateSettings(user: any, dto: UpdateAlertSettingsDto): Promise<{
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
