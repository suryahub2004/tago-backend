export class AiInsightItemDto {
  category: string;
  title: string;
  body: string;
  priority: string;
  iconEmoji: string;
  deepLinkRoute?: string;
  actionItems: string[];
  correlationNote?: string;
}

export class WorkoutSuggestionDto {
  type: string;
  durationMinutes: number;
  intensity: string;
  reason: string;
  exercises: string[];
}

export class AiCoachResponseDto {
  dailyBrief: string;
  readinessMessage: string;
  todayActions: string[];
  insights: AiInsightItemDto[];
  workoutSuggestion: WorkoutSuggestionDto;
}
