import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateSimpleTicketDto } from './dto/create-simple-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketStatus } from '@prisma/client';
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    createTicket(user: any, dto: CreateTicketDto): Promise<{
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
    createSimpleTicket(user: any, dto: CreateSimpleTicketDto): Promise<{
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
    getMyTickets(user: any): Promise<{
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
    getTicketDetail(user: any, id: string): Promise<{
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
    replyTicketAsUser(user: any, id: string, dto: ReplyTicketDto): Promise<{
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
    getAdminTicketDetail(id: string): Promise<{
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
    updateTicketStatus(id: string, status: TicketStatus): Promise<{
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
    replyTicketAsAdmin(id: string, admin: any, dto: ReplyTicketDto): Promise<{
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
