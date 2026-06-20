"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const kafka_producer_1 = require("../../kafka/kafka.producer");
const topics_1 = require("../../kafka/topics");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
let SupportService = class SupportService {
    prisma;
    kafkaProducer;
    constructor(prisma, kafkaProducer) {
        this.prisma = prisma;
        this.kafkaProducer = kafkaProducer;
    }
    async createTicket(userId, dto) {
        const initialMessage = {
            sender: 'user',
            text: dto.message,
            timestamp: new Date().toISOString(),
        };
        const ticket = await this.prisma.supportTicket.create({
            data: {
                userId,
                subject: dto.subject,
                priority: dto.priority,
                category: dto.category,
                messages: [initialMessage],
                status: client_1.TicketStatus.OPEN,
            },
        });
        return ticket;
    }
    async createSimpleTicket(userId, dto) {
        const initialMessage = {
            sender: 'user',
            text: dto.message,
            timestamp: new Date().toISOString(),
        };
        const ticket = await this.prisma.supportTicket.create({
            data: {
                userId,
                subject: dto.subject,
                priority: 'medium',
                category: 'general',
                messages: [initialMessage],
                status: client_1.TicketStatus.OPEN,
            },
        });
        console.log(`[Email] New support ticket created by ${userId}: ${ticket.id}`);
        return ticket;
    }
    async getMyTickets(userId) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getTicketDetail(userId, ticketId) {
        const ticket = await this.prisma.supportTicket.findFirst({
            where: { id: ticketId, userId },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async replyTicketAsUser(userId, ticketId, dto) {
        const ticket = await this.getTicketDetail(userId, ticketId);
        const messages = ticket.messages;
        messages.push({
            sender: 'user',
            text: dto.message,
            timestamp: new Date().toISOString(),
        });
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: { messages, status: client_1.TicketStatus.OPEN },
        });
    }
    async getAdminTickets(page, limit, status, search) {
        const where = {};
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { id: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.supportTicket.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.supportTicket.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getAdminTicketDetail(ticketId) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id: ticketId },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
            },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async updateTicketStatus(ticketId, status) {
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status },
        });
    }
    async replyTicketAsAdmin(ticketId, adminId, dto) {
        const ticket = await this.getAdminTicketDetail(ticketId);
        const messages = ticket.messages;
        messages.push({
            sender: 'admin',
            text: dto.message,
            timestamp: new Date().toISOString(),
            adminId,
        });
        const updated = await this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: { messages, status: client_1.TicketStatus.IN_PROGRESS },
        });
        await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.NOTIFICATION_SEND, {
            eventId: (0, uuid_1.v4)(),
            occurredAt: new Date().toISOString(),
            version: '1.0',
            userId: ticket.userId,
            title: 'Support Ticket Update',
            body: `An admin has replied to your ticket: ${ticket.subject}`,
            type: 'support_reply',
            data: { ticketId },
        });
        return updated;
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        kafka_producer_1.KafkaProducer])
], SupportService);
//# sourceMappingURL=support.service.js.map