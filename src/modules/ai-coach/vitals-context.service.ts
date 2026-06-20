import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

export interface HealthContext {
  name: string;
  age: number;
  gender: string;
  fitnessLevel: string;
  fitnessGoals: string[];
  conditions: string[];
  sleepGoal: number;
  stepsGoal: number;
  preferredWorkouts: string[];
  deviceType: string;
  avgHR: number;
  avgHRV: number;
  avgRestingHR: number;
  avgSpO2: number;
  avgSleepScore: number;
  avgSleepHours: number;
  avgSteps: number;
  avgStrain: number;
  avgStress: number;
  todayReadiness: number;
  batteryLevel: number;
  hrvBaseline: number;
}

@Injectable()
export class VitalsContextService {
  constructor(private readonly prisma: PrismaService) {}

  async buildContext(userId: string): Promise<HealthContext> {
    const [user, profile, device] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.healthProfile.findUnique({ where: { userId } }),
      this.prisma.device.findFirst({ where: { userId, isActive: true } }),
    ]);

    // In a real app, query InfluxDB. For now, returning mock 7-day averages.
    const vitals = {
      avgHR: 68,
      avgHRV: 55,
      avgRestingHR: 52,
      avgSpO2: 98,
      avgSleepScore: 82,
      avgSleepHours: 7.2,
      avgSteps: 8500,
      avgStrain: 12.4,
      avgStress: 35,
    };

    const readiness = 80;
    const hrvBaseline = 50;

    return {
      name: user?.name?.split(' ')[0] || 'User',
      age: profile?.age || 30,
      gender: profile?.gender || 'UNSPECIFIED',
      fitnessLevel: profile?.fitnessLevel || 'BEGINNER',
      fitnessGoals: profile?.fitnessGoal ? [profile.fitnessGoal] : [],
      conditions: profile?.conditions ?? [],
      sleepGoal: profile?.sleepGoal || 8,
      stepsGoal: profile?.stepsGoal || 10000,
      preferredWorkouts: profile?.preferredWorkouts ?? [],
      deviceType: device?.deviceType || 'NONE',
      ...vitals,
      todayReadiness: readiness,
      batteryLevel: device?.batteryLevel || 100,
      hrvBaseline: hrvBaseline,
    };
  }
}
