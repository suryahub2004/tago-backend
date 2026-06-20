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
exports.VitalsController = void 0;
const common_1 = require("@nestjs/common");
const vitals_service_1 = require("./vitals.service");
const batch_vital_dto_1 = require("./dto/batch-vital.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let VitalsController = class VitalsController {
    vitalsService;
    constructor(vitalsService) {
        this.vitalsService = vitalsService;
    }
    processBatch(user, dto) {
        return this.vitalsService.processBatch(user.id, dto);
    }
    getSummary(user, period) {
        return this.vitalsService.getSummary(user.id, period);
    }
    getHistory(user, type, period) {
        return this.vitalsService.getHistory(user.id, type, period);
    }
    getTrends(user, metric, days) {
        return this.vitalsService.getTrends(user.id, metric, days);
    }
    getCorrelations(user) {
        return this.vitalsService.getCorrelations(user.id);
    }
    getReport(user, period) {
        const p = period === 'weekly' ? 'weekly' : 'daily';
        return this.vitalsService.getReport(user.id, p);
    }
    getReadinessForecast(user) {
        return this.vitalsService.getReadinessForecast(user.id);
    }
    getWellnessSummary(user) {
        return this.vitalsService.getWellnessSummary(user.id);
    }
};
exports.VitalsController = VitalsController;
__decorate([
    (0, common_1.Post)('batch'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, batch_vital_dto_1.BatchVitalDto]),
    __metadata("design:returntype", void 0)
], VitalsController.prototype, "processBatch", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VitalsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('history/:type'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], VitalsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('trends'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('metric')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", void 0)
], VitalsController.prototype, "getTrends", null);
__decorate([
    (0, common_1.Get)('correlations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VitalsController.prototype, "getCorrelations", null);
__decorate([
    (0, common_1.Get)('report'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VitalsController.prototype, "getReport", null);
__decorate([
    (0, common_1.Get)('readiness-forecast'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VitalsController.prototype, "getReadinessForecast", null);
__decorate([
    (0, common_1.Get)('wellness-summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VitalsController.prototype, "getWellnessSummary", null);
exports.VitalsController = VitalsController = __decorate([
    (0, swagger_1.ApiTags)('Vitals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('vitals'),
    __metadata("design:paramtypes", [vitals_service_1.VitalsService])
], VitalsController);
//# sourceMappingURL=vitals.controller.js.map