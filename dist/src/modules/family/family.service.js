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
exports.FamilyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const crypto_1 = require("crypto");
const influxdb_service_1 = require("../influxdb/influxdb.service");
const defaultSharePermission = {
    heartRate: true,
    steps: true,
    calories: true,
    lastActive: true,
};
let FamilyService = class FamilyService {
    prisma;
    influxService;
    constructor(prisma, influxService) {
        this.prisma = prisma;
        this.influxService = influxService;
    }
    async getMyGroup(userId) {
        let group = await this.prisma.familyGroup.findFirst({
            where: { ownerUserId: userId },
            include: { members: { include: { member: true } } },
        });
        if (!group) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            group = await this.prisma.familyGroup.create({
                data: {
                    ownerUserId: userId,
                    name: `${user?.name || 'User'}'s Family`,
                },
                include: { members: { include: { member: true } } },
            });
        }
        return group;
    }
    async inviteMember(userId, dto) {
        const group = await this.getMyGroup(userId);
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        const inviteToken = (0, crypto_1.randomBytes)(20).toString('hex');
        const inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        if (!dto.email) {
            const existingPlaceholder = await this.prisma.familyMember.findFirst({
                where: {
                    familyGroupId: group.id,
                    memberUserId: userId,
                    inviteAccepted: false,
                    isActive: false,
                },
            });
            if (existingPlaceholder) {
                return this.prisma.familyMember.update({
                    where: { id: existingPlaceholder.id },
                    data: { inviteToken, inviteExpiresAt },
                });
            }
            return this.prisma.familyMember.create({
                data: {
                    familyGroupId: group.id,
                    memberUserId: userId,
                    relationship: dto.relationship,
                    inviteToken,
                    inviteExpiresAt,
                    inviteAccepted: false,
                    isActive: false,
                },
            });
        }
        const targetUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!targetUser)
            throw new common_1.NotFoundException('User with this email not found');
        if (targetUser.id === userId)
            throw new common_1.BadRequestException('Cannot invite yourself');
        const existing = await this.prisma.familyMember.findUnique({
            where: {
                familyGroupId_memberUserId: {
                    familyGroupId: group.id,
                    memberUserId: targetUser.id,
                },
            },
        });
        if (existing && existing.inviteAccepted)
            throw new common_1.BadRequestException('User is already in this family group');
        if (existing && !existing.inviteAccepted) {
            return this.prisma.familyMember.update({
                where: { id: existing.id },
                data: { inviteToken, inviteExpiresAt },
            });
        }
        return this.prisma.familyMember.create({
            data: {
                familyGroupId: group.id,
                memberUserId: targetUser.id,
                relationship: dto.relationship,
                inviteToken,
                inviteExpiresAt,
            },
        });
    }
    async validateInvite(token) {
        const member = await this.prisma.familyMember.findFirst({
            where: { inviteToken: token },
            include: {
                familyGroup: {
                    include: {
                        owner: true,
                    },
                },
            },
        });
        if (!member) {
            throw new common_1.NotFoundException('Invalid or expired invite token');
        }
        if (member.inviteExpiresAt && member.inviteExpiresAt < new Date()) {
            throw new common_1.NotFoundException('Invalid or expired invite token');
        }
        return {
            inviterId: member.familyGroup.owner.id,
            inviterName: member.familyGroup.owner.name,
            inviterAvatar: member.familyGroup.owner.avatarUrl,
            relationship: member.relationship,
        };
    }
    async acceptInvite(token, userId) {
        const member = await this.prisma.familyMember.findFirst({
            where: { inviteToken: token },
        });
        if (!member)
            throw new common_1.NotFoundException('Invalid or expired invite token');
        if (member.inviteExpiresAt && member.inviteExpiresAt < new Date()) {
            throw new common_1.BadRequestException('This invite link has expired');
        }
        const group = await this.prisma.familyGroup.findUnique({
            where: { id: member.familyGroupId },
        });
        if (group?.ownerUserId === userId) {
            throw new common_1.BadRequestException('You cannot join your own family group');
        }
        const alreadyMember = await this.prisma.familyMember.findUnique({
            where: {
                familyGroupId_memberUserId: {
                    familyGroupId: member.familyGroupId,
                    memberUserId: userId,
                },
            },
        });
        if (alreadyMember && alreadyMember.inviteAccepted) {
            throw new common_1.BadRequestException('You are already part of this family group');
        }
        if (member.memberUserId !== group?.ownerUserId && member.memberUserId !== userId) {
            throw new common_1.ForbiddenException('This invite is not for you');
        }
        if (alreadyMember) {
            if (member.id !== alreadyMember.id) {
                await this.prisma.familyMember.update({
                    where: { id: member.id },
                    data: { inviteToken: null },
                });
            }
            return this.prisma.familyMember.update({
                where: { id: alreadyMember.id },
                data: { inviteAccepted: true, inviteToken: null, isActive: true },
            });
        }
        return this.prisma.familyMember.update({
            where: { id: member.id },
            data: {
                memberUserId: userId,
                inviteAccepted: true,
                inviteToken: null,
                isActive: true,
            },
        });
    }
    async removeMember(userId, memberId) {
        const member = await this.prisma.familyMember.findUnique({
            where: { id: memberId },
            include: { familyGroup: true },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        if (member.familyGroup.ownerUserId !== userId &&
            member.memberUserId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to remove this member');
        }
        return this.prisma.familyMember.delete({ where: { id: memberId } });
    }
    async getMemberStatus(userId, memberId) {
        const membership = await this.prisma.familyMember.findFirst({
            where: {
                memberUserId: memberId,
                familyGroup: { ownerUserId: userId },
                inviteAccepted: true,
                isActive: true,
            },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('Not authorised to view this member');
        }
        const perms = membership.permissions
            ? membership.permissions
            : defaultSharePermission;
        try {
            const vitals = await this.influxService.getLatestVitals(memberId);
            return {
                status: vitals.heartRate > 0 && vitals.heartRate < 100 ? 'normal' : 'elevated',
                lastHeartRate: perms.heartRate ? vitals.heartRate : undefined,
                lastSpO2: perms.spo2 ? vitals.spo2 : undefined,
                lastActive: vitals.lastActive,
            };
        }
        catch {
            return { status: 'unknown', lastActive: new Date() };
        }
    }
    async getPendingInvites(userId) {
        const group = await this.getMyGroup(userId);
        if (!group)
            return [];
        return this.prisma.familyMember.findMany({
            where: { familyGroupId: group.id, inviteAccepted: false },
            include: { member: { select: { id: true, name: true, email: true } } },
        });
    }
    async cancelInvite(userId, inviteId) {
        const invite = await this.prisma.familyMember.findUnique({
            where: { id: inviteId },
            include: { familyGroup: true },
        });
        if (!invite || invite.familyGroup.ownerUserId !== userId) {
            throw new common_1.ForbiddenException('Cannot cancel this invite');
        }
        return this.prisma.familyMember.delete({ where: { id: inviteId } });
    }
    async updateMemberPermissions(userId, memberId, permissions) {
        const member = await this.prisma.familyMember.findUnique({
            where: { id: memberId },
            include: { familyGroup: true },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        if (member.familyGroup.ownerUserId !== userId &&
            member.memberUserId !== userId) {
            throw new common_1.ForbiddenException('No permission to update this member');
        }
        return this.prisma.familyMember.update({
            where: { id: memberId },
            data: { permissions: permissions },
        });
    }
    async getSharedVitals(memberId, requestingUserId) {
        const membership = await this.prisma.familyMember.findFirst({
            where: {
                memberUserId: memberId,
                familyGroup: { ownerUserId: requestingUserId },
                inviteAccepted: true,
                isActive: true,
            },
        });
        if (!membership)
            throw new common_1.ForbiddenException('Not authorised to view this member');
        const perms = membership.permissions
            ? membership.permissions
            : defaultSharePermission;
        const allVitals = await this.influxService.getLatestVitals(memberId);
        return {
            heartRate: perms.heartRate ? allVitals.heartRate : undefined,
            hrv: perms.hrv ? allVitals.hrv : undefined,
            spo2: perms.spo2 ? allVitals.spo2 : undefined,
            skinTemp: perms.skinTemperature ? allVitals.skinTemp : undefined,
            sleepScore: perms.sleepScore ? allVitals.sleepScore : undefined,
            sleepStages: perms.sleepStages ? allVitals.sleepStages : undefined,
            steps: perms.steps ? allVitals.steps : undefined,
            calories: perms.calories ? allVitals.calories : undefined,
            strain: perms.strain ? allVitals.strain : undefined,
            stress: perms.stressLevel ? allVitals.stress : undefined,
            deviceBattery: perms.deviceBattery ? allVitals.battery : undefined,
            lastActive: perms.lastActive ? allVitals.lastActive : undefined,
        };
    }
    async getFamilyChallenge(groupId, userId) {
        const group = await this.prisma.familyGroup.findUnique({
            where: { id: groupId },
            include: { members: true },
        });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        const isMember = group.ownerUserId === userId ||
            group.members.some((m) => m.memberUserId === userId);
        if (!isMember)
            throw new common_1.ForbiddenException('Not a member of this family group');
        return {
            id: `challenge-${groupId}`,
            title: 'Weekend Step Warrior',
            description: 'Who can hit 10k steps first this weekend?',
            type: 'STEPS',
            target: 10000,
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            participants: [
                { userId: group.ownerUserId, progress: 8500, status: 'leading' },
                ...group.members.map((m) => ({
                    userId: m.memberUserId,
                    progress: Math.floor(Math.random() * 8000),
                    status: 'active',
                })),
            ],
            reward: 'Family bragging rights 🏆',
        };
    }
    async getAdminFamilyGroups(page, limit) {
        const [data, total] = await Promise.all([
            this.prisma.familyGroup.findMany({
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    owner: { select: { id: true, name: true, email: true } },
                    _count: { select: { members: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.familyGroup.count(),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getAdminFamilyGroupDetail(id) {
        return this.prisma.familyGroup.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                members: {
                    include: {
                        member: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });
    }
};
exports.FamilyService = FamilyService;
exports.FamilyService = FamilyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        influxdb_service_1.InfluxDBService])
], FamilyService);
//# sourceMappingURL=family.service.js.map