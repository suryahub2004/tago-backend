import { PrismaService } from '../../database/prisma/prisma.service';
export declare class ExerciseLibraryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getExercises(filters: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        category: string;
        muscleGroup: string | null;
        equipment: string | null;
        videoUrl: string | null;
        isCustom: boolean;
    }[]>;
    getExercise(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        category: string;
        muscleGroup: string | null;
        equipment: string | null;
        videoUrl: string | null;
        isCustom: boolean;
    }>;
    createCustomExercise(data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        category: string;
        muscleGroup: string | null;
        equipment: string | null;
        videoUrl: string | null;
        isCustom: boolean;
    }>;
}
