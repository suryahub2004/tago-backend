import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
export declare class BroadcastController {
    private readonly broadcastService;
    constructor(broadcastService: BroadcastService);
    sendPopup(dto: CreateBroadcastDto, user: any): Promise<{
        id: string;
        type: string;
        title: string;
        body: string;
        imageUrl: string | null;
        isDismissable: boolean;
        actionLabel: string | null;
        actionUrl: string | null;
        targetSegment: string;
        sentAt: Date;
        recipientCount: number;
        sentByAdminId: string;
    }>;
    getMessages(page: number, limit: number): Promise<{
        data: ({
            sentByAdmin: {
                email: string;
                name: string;
            };
        } & {
            id: string;
            type: string;
            title: string;
            body: string;
            imageUrl: string | null;
            isDismissable: boolean;
            actionLabel: string | null;
            actionUrl: string | null;
            targetSegment: string;
            sentAt: Date;
            recipientCount: number;
            sentByAdminId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getMessage(id: string): Promise<({
        sentByAdmin: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        type: string;
        title: string;
        body: string;
        imageUrl: string | null;
        isDismissable: boolean;
        actionLabel: string | null;
        actionUrl: string | null;
        targetSegment: string;
        sentAt: Date;
        recipientCount: number;
        sentByAdminId: string;
    }) | null>;
}
