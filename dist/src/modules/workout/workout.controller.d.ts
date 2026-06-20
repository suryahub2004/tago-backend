import { WorkoutService } from './workout.service';
import { ExerciseLibraryService } from './exercise-library.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateLogDto } from './dto/create-log.dto';
export declare class WorkoutController {
    private readonly workoutService;
    private readonly exerciseLibrary;
    constructor(workoutService: WorkoutService, exerciseLibrary: ExerciseLibraryService);
    getExercises(query: any): Promise<{
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
    createCustomExercise(data: any, user: any): Promise<{
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
    getPlans(user: any, query: any): Promise<({
        days: {
            id: string;
            notes: string | null;
            planId: string;
            dayOfWeek: number;
            label: string;
            isRestDay: boolean;
            sortOrder: number;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        goal: string;
        durationWeeks: number;
        startDate: Date;
        endDate: Date | null;
        isAiGenerated: boolean;
    })[]>;
    createPlan(user: any, dto: CreatePlanDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        goal: string;
        durationWeeks: number;
        startDate: Date;
        endDate: Date | null;
        isAiGenerated: boolean;
    }>;
    getPlan(id: string): Promise<{
        days: ({
            exercises: {
                id: string;
                notes: string | null;
                dayId: string;
                sortOrder: number;
                sets: number | null;
                reps: number | null;
                durationSeconds: number | null;
                weightKg: number | null;
                restSeconds: number | null;
                exerciseId: string;
            }[];
        } & {
            id: string;
            notes: string | null;
            planId: string;
            dayOfWeek: number;
            label: string;
            isRestDay: boolean;
            sortOrder: number;
        })[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        goal: string;
        durationWeeks: number;
        startDate: Date;
        endDate: Date | null;
        isAiGenerated: boolean;
    }>;
    updatePlan(id: string, dto: UpdatePlanDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        goal: string;
        durationWeeks: number;
        startDate: Date;
        endDate: Date | null;
        isAiGenerated: boolean;
    }>;
    deletePlan(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        goal: string;
        durationWeeks: number;
        startDate: Date;
        endDate: Date | null;
        isAiGenerated: boolean;
    }>;
    activatePlan(user: any, id: string): Promise<{
        success: boolean;
    }>;
    logWorkout(user: any, dto: CreateLogDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        strain: number | null;
        notes: string | null;
        date: Date;
        completed: boolean;
        durationMinutes: number | null;
        perceivedEffort: number | null;
        avgHeartRate: number | null;
        peakHeartRate: number | null;
        caloriesBurned: number | null;
        exerciseLogs: import("@prisma/client/runtime/library").JsonValue | null;
        planId: string;
        dayId: string;
    }>;
    getLogs(user: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        strain: number | null;
        notes: string | null;
        date: Date;
        completed: boolean;
        durationMinutes: number | null;
        perceivedEffort: number | null;
        avgHeartRate: number | null;
        peakHeartRate: number | null;
        caloriesBurned: number | null;
        exerciseLogs: import("@prisma/client/runtime/library").JsonValue | null;
        planId: string;
        dayId: string;
    }[]>;
    getProgress(user: any): Promise<{
        currentPlan: {
            name: string;
            weekNumber: number;
            completionRate: number;
        } | null;
        thisWeek: {
            scheduled: number;
            completed: number;
            missed: number;
        };
        streak: {
            current: number;
            longest: number;
        };
        totalSessions: number;
        avgDuration: number;
    }>;
    getAdminStats(): Promise<{
        totalPlans: number;
        activePlans: number;
        totalLogs: number;
    }>;
    getUserWorkoutLogs(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        strain: number | null;
        notes: string | null;
        date: Date;
        completed: boolean;
        durationMinutes: number | null;
        perceivedEffort: number | null;
        avgHeartRate: number | null;
        peakHeartRate: number | null;
        caloriesBurned: number | null;
        exerciseLogs: import("@prisma/client/runtime/library").JsonValue | null;
        planId: string;
        dayId: string;
    }[]>;
    getAdminPlans(page?: string, limit?: string): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            goal: string;
            durationWeeks: number;
            startDate: Date;
            endDate: Date | null;
            isAiGenerated: boolean;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
