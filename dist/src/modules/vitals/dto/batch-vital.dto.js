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
exports.BatchVitalDto = exports.VitalRecordDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class VitalRecordDto {
    metricType;
    value;
    timestamp;
    confidence;
    deviceSerial;
    extra;
}
exports.VitalRecordDto = VitalRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'heart_rate' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VitalRecordDto.prototype, "metricType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75.5 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VitalRecordDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00.000Z', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VitalRecordDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.98, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VitalRecordDto.prototype, "confidence", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SN-RING-1234', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VitalRecordDto.prototype, "deviceSerial", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: {}, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], VitalRecordDto.prototype, "extra", void 0);
class BatchVitalDto {
    records;
}
exports.BatchVitalDto = BatchVitalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [VitalRecordDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VitalRecordDto),
    __metadata("design:type", Array)
], BatchVitalDto.prototype, "records", void 0);
//# sourceMappingURL=batch-vital.dto.js.map