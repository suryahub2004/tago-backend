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
exports.AiCoachController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const ai_coach_service_1 = require("./ai-coach.service");
const ask_question_dto_1 = require("./dto/ask-question.dto");
let AiCoachController = class AiCoachController {
    aiCoachService;
    constructor(aiCoachService) {
        this.aiCoachService = aiCoachService;
    }
    getInsights(req) {
        const userId = req.user?.id;
        if (!userId)
            throw new common_1.UnauthorizedException('User not found');
        return this.aiCoachService.getInsights(userId);
    }
    refreshInsights(req) {
        const userId = req.user?.id;
        if (!userId)
            throw new common_1.UnauthorizedException('User not found');
        return this.aiCoachService.getInsights(userId, true);
    }
    askQuestion(req, dto) {
        const userId = req.user?.id;
        if (!userId)
            throw new common_1.UnauthorizedException('User not found');
        return this.aiCoachService.askQuestion(userId, dto.question);
    }
    getWorkoutSuggestion(req) {
        const userId = req.user?.id;
        if (!userId)
            throw new common_1.UnauthorizedException('User not found');
        return this.aiCoachService.getWorkoutSuggestion(userId);
    }
    trackInteraction(req, body) {
        const userId = req.user?.id;
        if (!userId)
            throw new common_1.UnauthorizedException('User not found');
        return this.aiCoachService.trackInteraction(userId, body.insightId, body.type);
    }
    trackInteractionByPath(req, insightId, type) {
        const userId = req.user?.id;
        if (!userId)
            throw new common_1.UnauthorizedException('User not found');
        return this.aiCoachService.trackInteraction(userId, insightId, type);
    }
    getAdminInsights(page = '1', limit = '25', category) {
        return this.aiCoachService.getAdminInsightQuality(parseInt(page), parseInt(limit), category);
    }
    getUserInsights(userId) {
        return this.aiCoachService.getInsights(userId);
    }
};
exports.AiCoachController = AiCoachController;
__decorate([
    (0, common_1.Get)('insights'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiCoachController.prototype, "getInsights", null);
__decorate([
    (0, common_1.Post)('insights/refresh'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiCoachController.prototype, "refreshInsights", null);
__decorate([
    (0, common_1.Post)('ask'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ask_question_dto_1.AskQuestionDto]),
    __metadata("design:returntype", void 0)
], AiCoachController.prototype, "askQuestion", null);
__decorate([
    (0, common_1.Get)('workout-suggestion'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiCoachController.prototype, "getWorkoutSuggestion", null);
__decorate([
    (0, common_1.Post)('interactions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiCoachController.prototype, "trackInteraction", null);
__decorate([
    (0, common_1.Post)('insights/:id/interact'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AiCoachController.prototype, "trackInteractionByPath", null);
__decorate([
    (0, common_1.Get)('admin/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AiCoachController.prototype, "getAdminInsights", null);
__decorate([
    (0, common_1.Get)('admin/user/:userId/insights'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiCoachController.prototype, "getUserInsights", null);
exports.AiCoachController = AiCoachController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai-coach'),
    __metadata("design:paramtypes", [ai_coach_service_1.AiCoachService])
], AiCoachController);
//# sourceMappingURL=ai-coach.controller.js.map