import { FamilyService } from './family.service';
import { InviteMemberDto } from './dto/invite-member.dto';
export declare class FamilyController {
    private readonly familyService;
    constructor(familyService: FamilyService);
    getMyGroup(user: any): Promise<{
        members: ({
            member: {
                id: string;
                email: string;
                passwordHash: string | null;
                name: string;
                avatarUrl: string | null;
                role: import(".prisma/client").$Enums.UserRole;
                isActive: boolean;
                emailVerified: boolean;
                appleHealthToken: string | null;
                googleFitToken: string | null;
                fcmToken: string | null;
                phone: string | null;
                lastActiveAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            familyGroupId: string;
            memberUserId: string;
            relationship: string;
            permissions: import("@prisma/client/runtime/library").JsonValue | null;
            silentHoursStart: string | null;
            silentHoursEnd: string | null;
            inviteAccepted: boolean;
            inviteToken: string | null;
            inviteExpiresAt: Date | null;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: string;
    }>;
    getMyMembers(user: any): Promise<({
        member: {
            id: string;
            email: string;
            passwordHash: string | null;
            name: string;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            emailVerified: boolean;
            appleHealthToken: string | null;
            googleFitToken: string | null;
            fcmToken: string | null;
            phone: string | null;
            lastActiveAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        familyGroupId: string;
        memberUserId: string;
        relationship: string;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        silentHoursStart: string | null;
        silentHoursEnd: string | null;
        inviteAccepted: boolean;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
    })[]>;
    inviteMember(user: any, dto: InviteMemberDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        familyGroupId: string;
        memberUserId: string;
        relationship: string;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        silentHoursStart: string | null;
        silentHoursEnd: string | null;
        inviteAccepted: boolean;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
    }>;
    validateInvite(token: string): Promise<{
        inviterId: string;
        inviterName: string;
        inviterAvatar: string | null;
        relationship: string;
    }>;
    acceptInvite(user: any, token: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        familyGroupId: string;
        memberUserId: string;
        relationship: string;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        silentHoursStart: string | null;
        silentHoursEnd: string | null;
        inviteAccepted: boolean;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
    }>;
    removeMember(user: any, memberId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        familyGroupId: string;
        memberUserId: string;
        relationship: string;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        silentHoursStart: string | null;
        silentHoursEnd: string | null;
        inviteAccepted: boolean;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
    }>;
    getMemberStatus(user: any, memberId: string): Promise<{
        status: string;
        lastHeartRate: number | undefined;
        lastSpO2: number | undefined;
        lastActive: string;
    } | {
        status: string;
        lastActive: Date;
        lastHeartRate?: undefined;
        lastSpO2?: undefined;
    }>;
    getPendingInvites(user: any): Promise<({
        member: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        familyGroupId: string;
        memberUserId: string;
        relationship: string;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        silentHoursStart: string | null;
        silentHoursEnd: string | null;
        inviteAccepted: boolean;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
    })[]>;
    cancelInvite(user: any, inviteId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        familyGroupId: string;
        memberUserId: string;
        relationship: string;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        silentHoursStart: string | null;
        silentHoursEnd: string | null;
        inviteAccepted: boolean;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
    }>;
    updateMemberPermissions(user: any, memberId: string, permissions: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        familyGroupId: string;
        memberUserId: string;
        relationship: string;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        silentHoursStart: string | null;
        silentHoursEnd: string | null;
        inviteAccepted: boolean;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
    }>;
    getSharedVitals(user: any, memberId: string): Promise<{
        heartRate: number | undefined;
        hrv: number | undefined;
        spo2: number | undefined;
        skinTemp: number | undefined;
        sleepScore: number | undefined;
        sleepStages: {
            deep: string;
            light: string;
            rem: string;
        } | undefined;
        steps: number | undefined;
        calories: number | undefined;
        strain: number | undefined;
        stress: number | undefined;
        deviceBattery: number | undefined;
        lastActive: string | undefined;
    }>;
    getFamilyChallenge(user: any, groupId: string): Promise<{
        id: string;
        title: string;
        description: string;
        type: string;
        target: number;
        endDate: string;
        participants: {
            userId: string;
            progress: number;
            status: string;
        }[];
        reward: string;
    }>;
    getAdminFamilyGroups(page: number, limit: number): Promise<{
        data: ({
            _count: {
                members: number;
            };
            owner: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerUserId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAdminFamilyGroupDetail(id: string): Promise<({
        owner: {
            id: string;
            email: string;
            name: string;
        };
        members: ({
            member: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            familyGroupId: string;
            memberUserId: string;
            relationship: string;
            permissions: import("@prisma/client/runtime/library").JsonValue | null;
            silentHoursStart: string | null;
            silentHoursEnd: string | null;
            inviteAccepted: boolean;
            inviteToken: string | null;
            inviteExpiresAt: Date | null;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: string;
    }) | null>;
}
