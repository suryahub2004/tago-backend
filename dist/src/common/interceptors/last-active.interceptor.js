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
exports.LastActiveInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const redis_service_1 = require("../../modules/redis/redis.service");
let LastActiveInterceptor = class LastActiveInterceptor {
    prisma;
    redisService;
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        const startTime = Date.now();
        if (userId) {
            this.prisma.user
                .update({
                where: { id: userId },
                data: { lastActiveAt: new Date() },
            })
                .catch(() => { });
            const hourKey = `rate:${userId}:${new Date().getUTCHours()}`;
            this.redisService.client
                .incr(hourKey)
                .then(() => {
                this.redisService.client.expire(hourKey, 7200);
            })
                .catch(() => { });
        }
        return next.handle().pipe((0, operators_1.tap)(() => {
            const duration = Date.now() - startTime;
            this.redisService.client
                .zadd('metrics:response_times', duration, `${Date.now()}`)
                .catch(() => { });
            this.redisService.client
                .zremrangebyrank('metrics:response_times', 0, -1001)
                .catch(() => { });
        }));
    }
};
exports.LastActiveInterceptor = LastActiveInterceptor;
exports.LastActiveInterceptor = LastActiveInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], LastActiveInterceptor);
//# sourceMappingURL=last-active.interceptor.js.map