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
exports.AlertsController = void 0;
const common_1 = require("@nestjs/common");
const alerts_service_1 = require("./alerts.service");
const update_alert_settings_dto_1 = require("./dto/update-alert-settings.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
let AlertsController = class AlertsController {
    alertsService;
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    getMyAlerts(user, page, limit, severity, isRead) {
        const isReadBool = isRead !== undefined ? isRead === 'true' : undefined;
        return this.alertsService.getMyAlerts(user.id, page, limit, severity, isReadBool);
    }
    markAsRead(user, id) {
        return this.alertsService.markAsRead(user.id, id);
    }
    acknowledgeAlert(user, id) {
        return this.alertsService.acknowledgeAlert(user.id, id);
    }
    getSettings(user) {
        return this.alertsService.getSettings(user.id);
    }
    updateSettings(user, dto) {
        return this.alertsService.updateSettings(user.id, dto);
    }
    getAdminOverview() {
        return this.alertsService.getAdminOverview();
    }
    getAdminAlerts(page, limit, severity, userId) {
        return this.alertsService.getAdminAlerts(page, limit, severity, userId);
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(25), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('severity')),
    __param(4, (0, common_1.Query)('isRead')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Object, String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "getMyAlerts", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)(':id/acknowledge'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "acknowledgeAlert", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_alert_settings_dto_1.UpdateAlertSettingsDto]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "updateSettings", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "getAdminOverview", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/list'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(25), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "getAdminAlerts", null);
exports.AlertsController = AlertsController = __decorate([
    (0, swagger_1.ApiTags)('Alerts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('alerts'),
    __metadata("design:paramtypes", [alerts_service_1.AlertsService])
], AlertsController);
//# sourceMappingURL=alerts.controller.js.map