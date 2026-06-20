import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class ExerciseLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getExercises(filters: any) {
    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.muscleGroup) where.muscleGroup = filters.muscleGroup;
    if (filters.equipment) where.equipment = filters.equipment;
    if (filters.search)
      where.name = { contains: filters.search, mode: 'insensitive' };

    return this.prisma.exercise.findMany({ where });
  }

  async getExercise(id: string) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise) throw new NotFoundException('Exercise not found');
    return exercise;
  }

  async createCustomExercise(data: any) {
    return this.prisma.exercise.create({
      data: {
        ...data,
        isCustom: true,
      },
    });
  }
}
