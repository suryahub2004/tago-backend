"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseLibraryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let ExerciseLibraryService = class ExerciseLibraryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getExercises(filters) {
        const where = {};
        if (filters.category)
            where.category = filters.category;
        if (filters.muscleGroup)
            where.muscleGroup = filters.muscleGroup;
        if (filters.equipment)
            where.equipment = filters.equipment;
        if (filters.search)
            where.name = { contains: filters.search, mode: 'insensitive' };
        return this.prisma.exercise.findMany({ where });
    }
    async getExercise(id) {
        const exercise = await this.prisma.exercise.findUnique({ where: { id } });
        if (!exercise)
            throw new common_1.NotFoundException('Exercise not found');
        return exercise;
    }
    async createCustomExercise(data) {
        return this.prisma.exercise.create({
            data: {
                ...data,
                isCustom: true,
            },
        });
    }
};
exports.ExerciseLibraryService = ExerciseLibraryService;
exports.ExerciseLibraryService = ExerciseLibraryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExerciseLibraryService);
//# sourceMappingURL=exercise-library.service.js.map