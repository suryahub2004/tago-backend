export declare class CreatePlanExerciseDto {
    exerciseId: string;
    sets?: number;
    reps?: number;
    durationSeconds?: number;
    weightKg?: number;
    restSeconds?: number;
    notes?: string;
    sortOrder?: number;
}
export declare class CreatePlanDayDto {
    dayOfWeek: number;
    label: string;
    isRestDay?: boolean;
    notes?: string;
    sortOrder?: number;
    exercises?: CreatePlanExerciseDto[];
}
export declare class CreatePlanDto {
    name: string;
    description?: string;
    goal: string;
    durationWeeks: number;
    startDate: string;
    isAiGenerated?: boolean;
    days: CreatePlanDayDto[];
}
