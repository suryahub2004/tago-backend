"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiCoachResponseDto = exports.WorkoutSuggestionDto = exports.AiInsightItemDto = void 0;
class AiInsightItemDto {
    category;
    title;
    body;
    priority;
    iconEmoji;
    deepLinkRoute;
    actionItems;
    correlationNote;
}
exports.AiInsightItemDto = AiInsightItemDto;
class WorkoutSuggestionDto {
    type;
    durationMinutes;
    intensity;
    reason;
    exercises;
}
exports.WorkoutSuggestionDto = WorkoutSuggestionDto;
class AiCoachResponseDto {
    dailyBrief;
    readinessMessage;
    todayActions;
    insights;
    workoutSuggestion;
}
exports.AiCoachResponseDto = AiCoachResponseDto;
//# sourceMappingURL=ai-insight.dto.js.map