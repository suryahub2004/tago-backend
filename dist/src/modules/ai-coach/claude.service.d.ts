import { AiCoachResponseDto } from './dto/ai-insight.dto';
import { HealthContext } from './vitals-context.service';
export declare class ClaudeService {
    private readonly anthropicApiKey;
    private readonly model;
    generateInsights(context: HealthContext): Promise<AiCoachResponseDto>;
    answerQuestion(question: string, context: HealthContext): Promise<string>;
    private getMockResponse;
}
