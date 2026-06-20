import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(user: any, page: number, limit: number, isRead?: string): Promise<{
        data: {
            id: string;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
            type: string;
            title: string;
            isRead: boolean;
            body: string;
            sentAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markAsRead(user: any, id: string): Promise<{
        id: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        type: string;
        title: string;
        isRead: boolean;
        body: string;
        sentAt: Date;
    }>;
    markAllAsRead(user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    broadcastNotification(dto: CreateNotificationDto): Promise<{
        success: boolean;
        count: number;
    }>;
}
