import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { KAFKA_TOPICS } from '../../kafka/topics';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateSimpleTicketDto } from './dto/create-simple-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
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
        status: TicketStatus.OPEN,
      },
    });

    return ticket;
  }

  async createSimpleTicket(userId: string, dto: CreateSimpleTicketDto) {
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
        status: TicketStatus.OPEN,
      },
    });

    // Optionally send an email notification to the admin team
    console.log(`[Email] New support ticket created by ${userId}: ${ticket.id}`);

    return ticket;
  }

  async getMyTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getTicketDetail(userId: string, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, userId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async replyTicketAsUser(
    userId: string,
    ticketId: string,
    dto: ReplyTicketDto,
  ) {
    const ticket = await this.getTicketDetail(userId, ticketId);
    const messages = ticket.messages as any[];

    messages.push({
      sender: 'user',
      text: dto.message,
      timestamp: new Date().toISOString(),
    });

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { messages, status: TicketStatus.OPEN },
    });
  }

  // --- Admin Methods ---

  async getAdminTickets(
    page: number,
    limit: number,
    status?: TicketStatus,
    search?: string,
  ) {
    const where: any = {};
    if (status) where.status = status;
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

  async getAdminTicketDetail(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  }

  async replyTicketAsAdmin(
    ticketId: string,
    adminId: string,
    dto: ReplyTicketDto,
  ) {
    const ticket = await this.getAdminTicketDetail(ticketId);
    const messages = ticket.messages as any[];

    messages.push({
      sender: 'admin',
      text: dto.message,
      timestamp: new Date().toISOString(),
      adminId,
    });

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { messages, status: TicketStatus.IN_PROGRESS },
    });

    // Broadcast NOTIFICATION_SEND over Kafka
    await this.kafkaProducer.publish(KAFKA_TOPICS.NOTIFICATION_SEND, {
      eventId: uuid(),
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
}
