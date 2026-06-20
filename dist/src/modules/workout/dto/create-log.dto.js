"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLogDto = exports.ExerciseLogDto = void 0;
class ExerciseLogDto {
    exerciseId;
    sets;
}
exports.ExerciseLogDto = ExerciseLogDto;
class CreateLogDto {
    planId;
    dayId;
    date;
    completed;
    durationMinutes;
    perceivedEffort;
    notes;
    avgHeartRate;
    peakHeartRate;
    caloriesBurned;
    strain;
    exerciseLogs;
}
exports.CreateLogDto = CreateLogDto;
//# sourceMappingURL=create-log.dto.js.map