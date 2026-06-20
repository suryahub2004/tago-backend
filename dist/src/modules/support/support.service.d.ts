import { PrismaService } from '../../database/prisma/prisma.service';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateSimpleTicketDto } from './dto/create-simple-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketStatus } from '@prisma/client';
export declare class SupportService {
    private readonly prisma;
    private readonly kafkaProducer;
    constructor(prisma: PrismaService, kafkaProducer: KafkaProducer);
    createTicket(userId: string, dto: CreateTicketDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        category: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        messages: import("@prisma/client/runtime/library").JsonValue;
        subject: string;
    }>;
    createSimpleTicket(userId: string, dto: CreateSimpleTicketDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        category: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        messages: import("@prisma/client/runtime/library").JsonValue;
        subject: string;
    }>;
    getMyTickets(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        category: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        messages: import("@prisma/client/runtime/library").JsonValue;
        subject: string;
    }[]>;
    getTicketDetail(userId: string, ticketId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        category: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        messages: import("@prisma/client/runtime/library").JsonValue;
        subject: string;
    }>;
    replyTicketAsUser(userId: string, ticketId: string, dto: ReplyTicketDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        category: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        messages: import("@prisma/client/runtime/library").JsonValue;
        subject: string;
    }>;
    getAdminTickets(page: number, limit: number, status?: TicketStatus, search?: string): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            category: string;
            status: import(".prisma/client").$Enums.TicketStatus;
            priority: string;
            messages: import("@prisma/client/runtime/library").JsonValue;
            subject: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAdminTicketDetail(ticketId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        category: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        messages: import("@prisma/client/runtime/library").JsonValue;
        subject: string;
    }>;
    updateTicketStatus(ticketId: string, status: TicketStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        category: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        messages: import("@prisma/client/runtime/library").JsonValue;
        subject: string;
    }>;
    replyTicketAsAdmin(ticketId: string, adminId: string, dto: ReplyTicketDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        category: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        messages: import("@prisma/client/runtime/library").JsonValue;
        subject: string;
    }>;
}
