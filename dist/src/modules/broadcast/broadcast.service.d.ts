import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { AppGateway } from '../../gateways/app.gateway';
export declare class BroadcastService {
    private prisma;
    private kafkaProducer;
    private appGateway;
    constructor(prisma: PrismaService, kafkaProducer: KafkaProducer, appGateway: AppGateway);
    private _getTargetUsers;
    sendPopup(dto: CreateBroadcastDto, adminId: string): Promise<{
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
