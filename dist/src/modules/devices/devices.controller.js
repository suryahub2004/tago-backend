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
exports.DevicesController = void 0;
const common_1 = require("@nestjs/common");
const devices_service_1 = require("./devices.service");
const pair_device_dto_1 = require("./dto/pair-device.dto");
const update_device_settings_dto_1 = require("./dto/update-device-settings.dto");
const update_firmware_dto_1 = require("./dto/update-firmware.dto");
const update_device_by_serial_dto_1 = require("./dto/update-device-by-serial.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
let DevicesController = class DevicesController {
    devicesService;
    constructor(devicesService) {
        this.devicesService = devicesService;
    }
    pairDevice(user, dto) {
        return this.devicesService.pairDevice(user.id, dto);
    }
    unpairDevice(user, deviceId) {
        return this.devicesService.unpairDevice(user.id, deviceId);
    }
    getMyDevices(user) {
        return this.devicesService.getMyDevices(user.id);
    }
    updateSettings(user, deviceId, dto) {
        return this.devicesService.updateSettings(user.id, deviceId, dto);
    }
    updateFirmware(user, deviceId, dto) {
        return this.devicesService.updateFirmwareAndBattery(user.id, deviceId, dto);
    }
    updateBattery(user, deviceId, batteryLevel) {
        return this.devicesService.updateFirmwareAndBattery(user.id, deviceId, {
            batteryLevel,
        });
    }
    checkFirmware(user, deviceId) {
        return this.devicesService.checkFirmware(user.id, deviceId);
    }
    getFirmwareFile(version) {
        return this.devicesService.getFirmwareFile(version);
    }
    updateBySerial(serial, dto, user) {
        return this.devicesService.updateBySerial(serial, user.id, dto);
    }
    adminUnpairDevice(deviceId) {
        return this.devicesService.adminUnpairDevice(deviceId);
    }
    adminQueueFirmwareUpdate(deviceId) {
        return this.devicesService.adminQueueFirmwareUpdate(deviceId);
    }
    getAdminDevicesAnalytics() {
        return this.devicesService.getAdminDevicesAnalytics();
    }
    getFleetHealth() {
        return this.devicesService.getFleetHealth();
    }
    getAdminDevices(page, limit, deviceType, isActive, search) {
        const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
        return this.devicesService.getAdminDevices(page, limit, deviceType, activeBool, search);
    }
};
exports.DevicesController = DevicesController;
__decorate([
    (0, common_1.Post)('pair'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pair_device_dto_1.PairDeviceDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "pairDevice", null);
__decorate([
    (0, common_1.Delete)(':id/unpair'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "unpairDevice", null);
__decorate([
    (0, common_1.Get)('my-devices'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "getMyDevices", null);
__decorate([
    (0, common_1.Patch)(':id/settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_device_settings_dto_1.UpdateDeviceSettingsDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Patch)(':id/firmware'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_firmware_dto_1.UpdateFirmwareDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "updateFirmware", null);
__decorate([
    (0, common_1.Post)(':id/battery'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('batteryLevel', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "updateBattery", null);
__decorate([
    (0, common_1.Get)(':id/firmware-check'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "checkFirmware", null);
__decorate([
    (0, common_1.Get)('firmware/:version'),
    __param(0, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "getFirmwareFile", null);
__decorate([
    (0, common_1.Patch)('serial/:serial'),
    __param(0, (0, common_1.Param)('serial')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_device_by_serial_dto_1.UpdateDeviceBySerialDto, Object]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "updateBySerial", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Delete)('admin/:id/unpair'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "adminUnpairDevice", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Post)('admin/:id/firmware-update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "adminQueueFirmwareUpdate", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/analytics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "getAdminDevicesAnalytics", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/fleet-health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "getFleetHealth", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/list'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(25), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('deviceType')),
    __param(3, (0, common_1.Query)('isActive')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, String, String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "getAdminDevices", null);
exports.DevicesController = DevicesController = __decorate([
    (0, swagger_1.ApiTags)('Devices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('devices'),
    __metadata("design:paramtypes", [devices_service_1.DevicesService])
], DevicesController);
//# sourceMappingURL=devices.controller.js.map