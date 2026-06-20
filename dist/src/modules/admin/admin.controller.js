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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getOverviewStats(range) {
        let from;
        let to;
        if (range) {
            to = new Date();
            if (range === '7d')
                from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            else if (range === '30d')
                from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            else if (range === '90d')
                from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            else if (range === 'ytd') {
                from = new Date(new Date().getFullYear(), 0, 1);
            }
            else if (range === 'all') {
                from = new Date(0);
            }
        }
        return this.adminService.getOverviewStats(from, to);
    }
    getSystemHealth() {
        return this.adminService.getSystemHealth();
    }
    globalSearch(query) {
        return this.adminService.globalSearch(query);
    }
    getAuditLog(page = '1', limit = '25', userId, topic, from, to) {
        return this.adminService.getAuditLog(parseInt(page), parseInt(limit), userId, topic, from, to);
    }
    async exportUsersReport(res) {
        const csv = await this.adminService.exportUsersReport();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="users-report.csv"');
        res.send(csv);
    }
    async exportRevenueReport(res) {
        const csv = await this.adminService.exportRevenueReport();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.csv"');
        res.send(csv);
    }
    async exportDevicesReport(res) {
        const csv = await this.adminService.exportDevicesReport();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="devices-report.csv"');
        res.send(csv);
    }
    async exportAlertsReport(res) {
        const csv = await this.adminService.exportAlertsReport();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="alerts-report.csv"');
        res.send(csv);
    }
    broadcastMessage(body, req) {
        const adminId = req.user.id;
        return this.adminService.broadcastMessage(body, adminId);
    }
    getFirmwareVersions() {
        return this.adminService.getFirmwareVersions();
    }
    createFirmwareVersion(body) {
        return this.adminService.createFirmwareVersion(body);
    }
    updateFirmwareVersion(id, isLatest) {
        return this.adminService.updateFirmwareVersion(id, isLatest);
    }
    deleteFirmwareVersion(id) {
        return this.adminService.deleteFirmwareVersion(id);
    }
    getKafkaAuditLogs(page, limit) {
        return this.adminService.getKafkaAuditLogs(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 50);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('stats/overview'),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOverviewStats", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('stats/health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSystemHealth", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "globalSearch", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('audit'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('topic')),
    __param(4, (0, common_1.Query)('from')),
    __param(5, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLog", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Get)('reports/users'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportUsersReport", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Get)('reports/revenue'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportRevenueReport", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Get)('reports/devices'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportDevicesReport", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Get)('reports/alerts'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportAlertsReport", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Post)('broadcast'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "broadcastMessage", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('firmware'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getFirmwareVersions", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Post)('firmware'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createFirmwareVersion", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Patch)('firmware/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isLatest')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateFirmwareVersion", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Delete)('firmware/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteFirmwareVersion", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Get)('kafka-audit'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getKafkaAuditLogs", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map