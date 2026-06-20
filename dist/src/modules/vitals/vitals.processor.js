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
var VitalsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitalsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const influxdb_service_1 = require("../influxdb/influxdb.service");
const influxdb_client_1 = require("@influxdata/influxdb-client");
const common_1 = require("@nestjs/common");
const kafka_producer_1 = require("../../kafka/kafka.producer");
const topics_1 = require("../../kafka/topics");
const uuid_1 = require("uuid");
let VitalsProcessor = VitalsProcessor_1 = class VitalsProcessor {
    influxDB;
    kafkaProducer;
    logger = new common_1.Logger(VitalsProcessor_1.name);
    constructor(influxDB, kafkaProducer) {
        this.influxDB = influxDB;
        this.kafkaProducer = kafkaProducer;
    }
    async handleProcessVitals(job) {
        const { userId, records } = job.data;
        this.logger.debug(`Processing vitals batch for user ${userId}, size: ${records.length}`);
        for (const record of records) {
            const point = new influxdb_client_1.Point('health_metrics')
                .tag('user_id', userId)
                .tag('device_id', record.deviceSerial)
                .tag('metric_type', record.metricType)
                .floatField('value', record.value)
                .floatField('confidence', record.confidence)
                .timestamp(new Date(record.timestamp));
            this.influxDB.writeApi.writePoint(point);
        }
        await this.influxDB.writeApi.flush();
        this.logger.debug(`Flushed vitals to InfluxDB for user ${userId}`);
        const metricTypes = [
            ...new Set(records.map((r) => r.metricType)),
        ];
        const latestReadings = {};
        for (const record of records) {
            latestReadings[record.metricType] = record.value;
        }
        await this.kafkaProducer.publish(topics_1.KAFKA_TOPICS.VITALS_BATCH_UPLOADED, {
            eventId: (0, uuid_1.v4)(),
            occurredAt: new Date().toISOString(),
            version: '1.0',
            userId,
            deviceId: records[0]?.deviceSerial || 'unknown',
            deviceType: 'UNKNOWN',
            readingsCount: records.length,
            metricTypes,
            latestReadings,
        });
        return { success: true, count: records.length };
    }
};
exports.VitalsProcessor = VitalsProcessor;
__decorate([
    (0, bull_1.Process)('process-vitals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VitalsProcessor.prototype, "handleProcessVitals", null);
exports.VitalsProcessor = VitalsProcessor = VitalsProcessor_1 = __decorate([
    (0, bull_1.Processor)('vitals-queue'),
    __metadata("design:paramtypes", [influxdb_service_1.InfluxDBService,
        kafka_producer_1.KafkaProducer])
], VitalsProcessor);
//# sourceMappingURL=vitals.processor.js.map