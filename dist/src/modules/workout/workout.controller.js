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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutController = void 0;
const common_1 = require("@nestjs/common");
const workout_service_1 = require("./workout.service");
const exercise_library_service_1 = require("./exercise-library.service");
const create_plan_dto_1 = require("./dto/create-plan.dto");
const update_plan_dto_1 = require("./dto/update-plan.dto");
const create_log_dto_1 = require("./dto/create-log.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let WorkoutController = class WorkoutController {
    workoutService;
    exerciseLibrary;
    constructor(workoutService, exerciseLibrary) {
        this.workoutService = workoutService;
        this.exerciseLibrary = exerciseLibrary;
    }
    getExercises(query) {
        return this.exerciseLibrary.getExercises(query);
    }
    getExercise(id) {
        return this.exerciseLibrary.getExercise(id);
    }
    createCustomExercise(data, user) {
        return this.exerciseLibrary.createCustomExercise({ ...data, userId: user.id });
    }
    getPlans(user, query) {
        return this.workoutService.getPlans(user.id, query);
    }
    createPlan(user, dto) {
        return this.workoutService.createPlan(user.id, dto);
    }
    getPlan(id) {
        return this.workoutService.getPlan(id);
    }
    updatePlan(id, dto) {
        return this.workoutService.updatePlan(id, dto);
    }
    deletePlan(id) {
        return this.workoutService.deletePlan(id);
    }
    activatePlan(user, id) {
        return this.workoutService.activatePlan(user.id, id);
    }
    logWorkout(user, dto) {
        return this.workoutService.logWorkout(user.id, dto);
    }
    getLogs(user) {
        return this.workoutService.getLogs(user.id);
    }
    getProgress(user) {
        return this.workoutService.getProgress(user.id);
    }
    getAdminStats() {
        return this.workoutService.getAdminStats();
    }
    getUserWorkoutLogs(userId) {
        return this.workoutService.getLogs(userId);
    }
    getAdminPlans(page = '1', limit = '25') {
        return this.workoutService.getAdminPlans(parseInt(page), parseInt(limit));
    }
};
exports.WorkoutController = WorkoutController;
__decorate([
    (0, common_1.Get)('exercises'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "getExercises", null);
__decorate([
    (0, common_1.Get)('exercises/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "getExercise", null);
__decorate([
    (0, common_1.Post)('exercises'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "createCustomExercise", null);
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_plan_dto_1.CreatePlanDto]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Patch)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_plan_dto_1.UpdatePlanDto]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Delete)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.Patch)('plans/:id/activate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "activatePlan", null);
__decorate([
    (0, common_1.Post)('logs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_log_dto_1.CreateLogDto]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "logWorkout", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('progress'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "getProgress", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "getAdminStats", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/user/:userId/logs'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "getUserWorkoutLogs", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/plans'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkoutController.prototype, "getAdminPlans", null);
exports.WorkoutController = WorkoutController = __decorate([
    (0, swagger_1.ApiTags)('Workout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('workout'),
    __metadata("design:paramtypes", [workout_service_1.WorkoutService,
        exercise_library_service_1.ExerciseLibraryService])
], WorkoutController);
//# sourceMappingURL=workout.controller.js.map