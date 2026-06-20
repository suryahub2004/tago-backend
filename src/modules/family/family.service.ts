import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { randomBytes } from 'crypto';
import { InfluxDBService } from '../influxdb/influxdb.service';

type SharePermission = {
  heartRate?: boolean;
  hrv?: boolean;
  spo2?: boolean;
  skinTemperature?: boolean;
  sleepScore?: boolean;
  sleepStages?: boolean;
  steps?: boolean;
  calories?: boolean;
  strain?: boolean;
  stressLevel?: boolean;
  deviceBattery?: boolean;
  lastActive?: boolean;
};

const defaultSharePermission: SharePermission = {
  heartRate: true,
  steps: true,
  calories: true,
  lastActive: true,
};

@Injectable()
export class FamilyService {
  constructor(
    private prisma: PrismaService,
    private influxService: InfluxDBService,
  ) {}

  async getMyGroup(userId: string) {
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

  async inviteMember(userId: string, dto: InviteMemberDto) {
    const group = await this.getMyGroup(userId);
    if (!group) throw new NotFoundException('Group not found');

    const inviteToken = randomBytes(20).toString('hex');
    const inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // ── Token-only invite (QR / share link) ──────────────────────────────
    if (!dto.email) {
      // Check if a placeholder record already exists for this owner.
      // The unique constraint on (familyGroupId, memberUserId) means we
      // cannot insert a second row — we must UPDATE the existing one instead.
      const existingPlaceholder = await this.prisma.familyMember.findFirst({
        where: {
          familyGroupId: group.id,
          memberUserId: userId,       // owner used as temp placeholder
          inviteAccepted: false,
          isActive: false,
        },
      });

      if (existingPlaceholder) {
        // Refresh token so the user gets a new fresh QR code
        return this.prisma.familyMember.update({
          where: { id: existingPlaceholder.id },
          data: { inviteToken, inviteExpiresAt },
        });
      }

      // No placeholder yet — create the first one
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

    // ── Email-based invite ────────────────────────────────────────────────
    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!targetUser)
      throw new NotFoundException('User with this email not found');
    if (targetUser.id === userId)
      throw new BadRequestException('Cannot invite yourself');

    const existing = await this.prisma.familyMember.findUnique({
      where: {
        familyGroupId_memberUserId: {
          familyGroupId: group.id,
          memberUserId: targetUser.id,
        },
      },
    });
    if (existing && existing.inviteAccepted)
      throw new BadRequestException('User is already in this family group');

    if (existing && !existing.inviteAccepted) {
      // Refresh the token on re-invite
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

  async validateInvite(token: string) {
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
      throw new NotFoundException('Invalid or expired invite token');
    }

    if (member.inviteExpiresAt && member.inviteExpiresAt < new Date()) {
      throw new NotFoundException('Invalid or expired invite token');
    }

    return {
      inviterId: member.familyGroup.owner.id,
      inviterName: member.familyGroup.owner.name,
      inviterAvatar: member.familyGroup.owner.avatarUrl,
      relationship: member.relationship,
    };
  }

  async acceptInvite(token: string, userId: string) {
    const member = await this.prisma.familyMember.findFirst({
      where: { inviteToken: token },
    });
    if (!member) throw new NotFoundException('Invalid or expired invite token');

    // Check expiry
    if (member.inviteExpiresAt && member.inviteExpiresAt < new Date()) {
      throw new BadRequestException('This invite link has expired');
    }

    // Prevent owner from accepting their own placeholder token-only invite
    const group = await this.prisma.familyGroup.findUnique({
      where: { id: member.familyGroupId },
    });
    if (group?.ownerUserId === userId) {
      throw new BadRequestException('You cannot join your own family group');
    }

    // For token-only invites the memberUserId is the owner's id as placeholder.
    // Check if the accepting user is already a real member of the group.
    const alreadyMember = await this.prisma.familyMember.findUnique({
      where: {
        familyGroupId_memberUserId: {
          familyGroupId: member.familyGroupId,
          memberUserId: userId,
        },
      },
    });
    if (alreadyMember && alreadyMember.inviteAccepted) {
      throw new BadRequestException('You are already part of this family group');
    }

    // For email-based invites — verify this is the right user
    if (member.memberUserId !== group?.ownerUserId && member.memberUserId !== userId) {
      throw new ForbiddenException('This invite is not for you');
    }

    // Update or create the real membership record
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
        memberUserId: userId,     // replace owner placeholder with real user
        inviteAccepted: true,
        inviteToken: null,
        isActive: true,
      },
    });
  }

  async removeMember(userId: string, memberId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
      include: { familyGroup: true },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (
      member.familyGroup.ownerUserId !== userId &&
      member.memberUserId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to remove this member',
      );
    }

    return this.prisma.familyMember.delete({ where: { id: memberId } });
  }

  // updatePermission (permissionLevel) removed per V4

  async getMemberStatus(userId: string, memberId: string) {
    // Find the family membership and verify the caller has access
    const membership = await this.prisma.familyMember.findFirst({
      where: {
        memberUserId: memberId,
        familyGroup: { ownerUserId: userId },
        inviteAccepted: true,
        isActive: true,
      },
    });
    if (!membership) {
      throw new ForbiddenException('Not authorised to view this member');
    }

    const perms = membership.permissions
      ? (membership.permissions as any)
      : defaultSharePermission;

    try {
      const vitals = await this.influxService.getLatestVitals(memberId);
      return {
        status: vitals.heartRate > 0 && vitals.heartRate < 100 ? 'normal' : 'elevated',
        lastHeartRate: perms.heartRate ? vitals.heartRate : undefined,
        lastSpO2: perms.spo2 ? vitals.spo2 : undefined,
        lastActive: vitals.lastActive,
      };
    } catch {
      return { status: 'unknown', lastActive: new Date() };
    }
  }

  async getPendingInvites(userId: string) {
    const group = await this.getMyGroup(userId);
    if (!group) return [];
    return this.prisma.familyMember.findMany({
      where: { familyGroupId: group.id, inviteAccepted: false },
      include: { member: { select: { id: true, name: true, email: true } } },
    });
  }

  async cancelInvite(userId: string, inviteId: string) {
    const invite = await this.prisma.familyMember.findUnique({
      where: { id: inviteId },
      include: { familyGroup: true },
    });
    if (!invite || invite.familyGroup.ownerUserId !== userId) {
      throw new ForbiddenException('Cannot cancel this invite');
    }
    return this.prisma.familyMember.delete({ where: { id: inviteId } });
  }

  async updateMemberPermissions(
    userId: string,
    memberId: string,
    permissions: any,
  ) {
    const member = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
      include: { familyGroup: true },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (
      member.familyGroup.ownerUserId !== userId &&
      member.memberUserId !== userId
    ) {
      throw new ForbiddenException('No permission to update this member');
    }

    return this.prisma.familyMember.update({
      where: { id: memberId },
      data: { permissions: permissions },
    });
  }

  async getSharedVitals(memberId: string, requestingUserId: string) {
    // 1. Find family relationship
    const membership = await this.prisma.familyMember.findFirst({
      where: {
        memberUserId: memberId,
        familyGroup: { ownerUserId: requestingUserId },
        inviteAccepted: true,
        isActive: true,
      },
    });
    if (!membership)
      throw new ForbiddenException('Not authorised to view this member');

    // 2. Parse permissions (default if null)
    const perms = membership.permissions
      ? (membership.permissions as SharePermission)
      : defaultSharePermission;

    // 3. Get vitals from InfluxDB
    const allVitals = await this.influxService.getLatestVitals(memberId);

    // 4. Filter based on permissions — only return what's allowed
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

  async getFamilyChallenge(groupId: string, userId: string) {
    const group = await this.prisma.familyGroup.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) throw new NotFoundException('Group not found');

    const isMember =
      group.ownerUserId === userId ||
      group.members.some((m) => m.memberUserId === userId);
    if (!isMember)
      throw new ForbiddenException('Not a member of this family group');

    // Return mock active challenge for the mobile widget
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

  // Admin endpoints
  async getAdminFamilyGroups(page: number, limit: number) {
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

  async getAdminFamilyGroupDetail(id: string) {
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
}
