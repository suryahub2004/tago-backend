export class MeditationStatsDto {
  streak: { current: number; longest: number };
  totalSessions: number;
  totalMinutes: number;
  avgHrvDelta: number;
  bestHrvDelta: number;
  sessionsByCategory: Record<string, number>;
}
