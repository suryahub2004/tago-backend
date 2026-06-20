export class CreateSessionDto {
  patternId: string;
  patternName: string;
  category: string;
  durationSeconds: number;
  cyclesCompleted: number;
  hrvBefore?: number;
  hrvAfter?: number;
  breathHoldSeconds?: number;
  breathHoldCount?: number;
  notes?: string;
}
