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
var InfluxDBService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluxDBService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const influxdb_client_1 = require("@influxdata/influxdb-client");
const common_2 = require("@nestjs/common");
let InfluxDBService = InfluxDBService_1 = class InfluxDBService {
    configService;
    client;
    writeApi;
    queryApi;
    logger = new common_2.Logger(InfluxDBService_1.name);
    constructor(configService) {
        this.configService = configService;
        const url = this.configService.get('INFLUXDB_URL') || 'http://localhost:8086';
        const token = this.configService.get('INFLUXDB_TOKEN') || '';
        const org = this.configService.get('INFLUXDB_ORG') || 'smartvital';
        const bucket = this.configService.get('INFLUXDB_BUCKET') || 'health_metrics';
        this.client = new influxdb_client_1.InfluxDB({ url, token });
        this.writeApi = this.client.getWriteApi(org, bucket, 'ns');
        this.queryApi = this.client.getQueryApi(org);
    }
    get bucket() {
        return (this.configService.get('INFLUXDB_BUCKET') || 'health_metrics');
    }
    async onModuleInit() {
    }
    async onModuleDestroy() {
        await this.writeApi.close();
    }
    async getLatestVitals(userId) {
        const defaults = {
            heartRate: 0,
            hrv: 0,
            spo2: 0,
            skinTemp: 0,
            sleepScore: 0,
            sleepStages: { deep: '0h', light: '0h', rem: '0h' },
            steps: 0,
            calories: 0,
            strain: 0,
            stress: 0,
            battery: 0,
            lastActive: new Date().toISOString(),
        };
        try {
            const fluxQuery = `
        from(bucket: "${this.bucket}")
          |> range(start: -24h)
          |> filter(fn: (r) => r["user_id"] == "${userId}")
          |> filter(fn: (r) => r["_measurement"] == "health_metrics")
          |> last()
          |> pivot(rowKey: ["_time"], columnKey: ["metric_type"], valueColumn: "_value")
      `;
            const rows = [];
            for await (const { values, tableMeta } of this.queryApi.iterateRows(fluxQuery)) {
                rows.push(tableMeta.toObject(values));
            }
            if (rows.length === 0)
                return defaults;
            const merged = {};
            let lastActive = defaults.lastActive;
            for (const row of rows) {
                for (const [k, v] of Object.entries(row)) {
                    if (typeof v === 'number' && !isNaN(v)) {
                        if (merged[k] === undefined || v > merged[k]) {
                            merged[k] = v;
                        }
                    }
                    if (k === '_time' && typeof v === 'string') {
                        if (!lastActive || v > lastActive)
                            lastActive = v;
                    }
                }
            }
            const deepMin = Math.round(merged['deep_sleep'] ?? 0);
            const lightMin = Math.round(merged['light_sleep'] ?? 0);
            const remMin = Math.round(merged['rem_sleep'] ?? 0);
            const sleepScore = Math.round(merged['sleep_score'] ??
                (deepMin > 0 ? Math.min(100, Math.round((deepMin / Math.max(deepMin + lightMin + remMin, 1)) * 100)) : 0));
            return {
                heartRate: Math.round(merged['heart_rate'] ?? 0),
                hrv: Math.round(merged['hrv'] ?? 0),
                spo2: Math.round(merged['spo2'] ?? 0),
                skinTemp: Number((merged['skin_temp'] ?? 0).toFixed(1)),
                sleepScore,
                sleepStages: {
                    deep: `${Math.floor(deepMin / 60)}h ${deepMin % 60}m`,
                    light: `${Math.floor(lightMin / 60)}h ${lightMin % 60}m`,
                    rem: `${Math.floor(remMin / 60)}h ${remMin % 60}m`,
                },
                steps: Math.round(merged['steps'] ?? 0),
                calories: Math.round(merged['calories'] ?? 0),
                strain: Number((merged['strain'] ?? 0).toFixed(1)),
                stress: Math.round(merged['stress'] ?? 0),
                battery: Math.round(merged['battery'] ?? 0),
                lastActive,
            };
        }
        catch (e) {
            this.logger.warn(`getLatestVitals failed for user ${userId}: ${e}`);
            return defaults;
        }
    }
};
exports.InfluxDBService = InfluxDBService;
exports.InfluxDBService = InfluxDBService = InfluxDBService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], InfluxDBService);
//# sourceMappingURL=influxdb.service.js.map