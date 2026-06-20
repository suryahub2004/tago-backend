export class CreatePlanExerciseDto {
  exerciseId: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  weightKg?: number;
  restSeconds?: number;
  notes?: string;
  sortOrder?: number;
}

export class CreatePlanDayDto {
  dayOfWeek: number;
  label: string;
  isRestDay?: boolean;
  notes?: string;
  sortOrder?: number;
  exercises?: CreatePlanExerciseDto[];
}

export class CreatePlanDto {
  name: string;
  description?: string;
  goal: string;
  durationWeeks: number;
  startDate: string; // ISO string
  isAiGenerated?: boolean;
  days: CreatePlanDayDto[];
}
