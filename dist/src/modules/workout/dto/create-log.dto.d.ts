export declare class ExerciseLogDto {
    exerciseId: string;
    sets: {
        reps?: number;
        weightKg?: number;
        completed: boolean;
    }[];
}
export declare class CreateLogDto {
    planId: string;
    dayId: string;
    date: string;
    completed?: boolean;
    durationMinutes?: number;
    perceivedEffort?: number;
    notes?: string;
    avgHeartRate?: number;
    peakHeartRate?: number;
    caloriesBurned?: number;
    strain?: number;
    exerciseLogs?: ExerciseLogDto[];
}
