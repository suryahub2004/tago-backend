import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyNotifications(userId: string, page: number, limit: number, isRead?: boolean): Promise<{
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
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        type: string;
        title: string;
        isRead: boolean;
        body: string;
        sentAt: Date;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createNotification(userId: string, dto: CreateNotificationDto): Promise<{
        id: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        type: string;
        title: string;
        isRead: boolean;
        body: string;
        sentAt: Date;
    }>;
    broadcastNotification(dto: CreateNotificationDto): Promise<{
        success: boolean;
        count: number;
    }>;
}
