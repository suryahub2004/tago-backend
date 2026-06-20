"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlanDto = exports.CreatePlanDayDto = exports.CreatePlanExerciseDto = void 0;
class CreatePlanExerciseDto {
    exerciseId;
    sets;
    reps;
    durationSeconds;
    weightKg;
    restSeconds;
    notes;
    sortOrder;
}
exports.CreatePlanExerciseDto = CreatePlanExerciseDto;
class CreatePlanDayDto {
    dayOfWeek;
    label;
    isRestDay;
    notes;
    sortOrder;
    exercises;
}
exports.CreatePlanDayDto = CreatePlanDayDto;
class CreatePlanDto {
    name;
    description;
    goal;
    durationWeeks;
    startDate;
    isAiGenerated;
    days;
}
exports.CreatePlanDto = CreatePlanDto;
//# sourceMappingURL=create-plan.dto.js.map