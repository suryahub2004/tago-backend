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
exports.MeditationController = void 0;
const common_1 = require("@nestjs/common");
const meditation_service_1 = require("./meditation.service");
const create_session_dto_1 = require("./dto/create-session.dto");
let MeditationController = class MeditationController {
    meditationService;
    constructor(meditationService) {
        this.meditationService = meditationService;
    }
    createSession(req, dto) {
        const userId = req.user?.id || 'demo-user-id';
        return this.meditationService.createSession(userId, dto);
    }
    getSessions(req, query) {
        const userId = req.user?.id || 'demo-user-id';
        return this.meditationService.getSessions(userId, query);
    }
    getStats(req) {
        const userId = req.user?.id || 'demo-user-id';
        return this.meditationService.getStats(userId);
    }
    getHrvImpact(req) {
        const userId = req.user?.id || 'demo-user-id';
        return this.meditationService.getHrvImpact(userId);
    }
    getUserSessions(userId) {
        return this.meditationService.getSessions(userId, {});
    }
};
exports.MeditationController = MeditationController;
__decorate([
    (0, common_1.Post)('sessions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_session_dto_1.CreateSessionDto]),
    __metadata("design:returntype", void 0)
], MeditationController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('sessions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MeditationController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MeditationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('hrv-impact'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MeditationController.prototype, "getHrvImpact", null);
__decorate([
    (0, common_1.Get)('admin/user/:userId/sessions'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MeditationController.prototype, "getUserSessions", null);
exports.MeditationController = MeditationController = __decorate([
    (0, common_1.Controller)('meditation'),
    __metadata("design:paramtypes", [meditation_service_1.MeditationService])
], MeditationController);
//# sourceMappingURL=meditation.controller.js.map