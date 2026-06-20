import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, WriteApi, QueryApi } from '@influxdata/influxdb-client';
import { Logger } from '@nestjs/common';

@Injectable()
export class InfluxDBService implements OnModuleInit, OnModuleDestroy {
  private client: InfluxDB;
  public writeApi: WriteApi;
  public queryApi: QueryApi;
  private readonly logger = new Logger(InfluxDBService.name);

  constructor(private readonly configService: ConfigService) {
    const url =
      this.configService.get<string>('INFLUXDB_URL') || 'http://localhost:8086';
    const token = this.configService.get<string>('INFLUXDB_TOKEN') || '';
    const org = this.configService.get<string>('INFLUXDB_ORG') || 'smartvital';
    const bucket =
      this.configService.get<string>('INFLUXDB_BUCKET') || 'health_metrics';

    this.client = new InfluxDB({ url, token });
    this.writeApi = this.client.getWriteApi(org, bucket, 'ns');
    this.queryApi = this.client.getQueryApi(org);
  }

  get bucket(): string {
    return (
      this.configService.get<string>('INFLUXDB_BUCKET') || 'health_metrics'
    );
  }

  async onModuleInit() {
    // WriteApi buffers internally — no ping needed
  }

  async onModuleDestroy() {
    await this.writeApi.close();
  }

  /**
   * Returns the latest value for each vital metric for a given user.
   * Queries InfluxDB using a pivot to produce a flat map:
   *   { heartRate: 72, hrv: 45, spo2: 98, ... }
   *
   * Falls back to zeros if InfluxDB is unavailable or the user has no data.
   */
  async getLatestVitals(userId: string): Promise<{
    heartRate: number;
    hrv: number;
    spo2: number;
    skinTemp: number;
    sleepScore: number;
    sleepStages: { deep: string; light: string; rem: string };
    steps: number;
    calories: number;
    strain: number;
    stress: number;
    battery: number;
    lastActive: string;
  }> {
    // Default empty result
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
      // Query last 24h of data and take the most recent value per metric
      const fluxQuery = `
        from(bucket: "${this.bucket}")
          |> range(start: -24h)
          |> filter(fn: (r) => r["user_id"] == "${userId}")
          |> filter(fn: (r) => r["_measurement"] == "health_metrics")
          |> last()
          |> pivot(rowKey: ["_time"], columnKey: ["metric_type"], valueColumn: "_value")
      `;

      const rows: Record<string, any>[] = [];
      for await (const { values, tableMeta } of this.queryApi.iterateRows(fluxQuery)) {
        rows.push(tableMeta.toObject(values));
      }

      if (rows.length === 0) return defaults;

      // Merge all pivot rows — multiple rows may exist if metrics have
      // different last-timestamps. Take the max value per column.
      const merged: Record<string, number> = {};
      let lastActive = defaults.lastActive;

      for (const row of rows) {
        for (const [k, v] of Object.entries(row)) {
          if (typeof v === 'number' && !isNaN(v)) {
            if (merged[k] === undefined || v > merged[k]) {
              merged[k] = v;
            }
          }
          if (k === '_time' && typeof v === 'string') {
            if (!lastActive || v > lastActive) lastActive = v;
          }
        }
      }

      const deepMin   = Math.round(merged['deep_sleep'] ?? 0);
      const lightMin  = Math.round(merged['light_sleep'] ?? 0);
      const remMin    = Math.round(merged['rem_sleep']   ?? 0);
      const sleepScore = Math.round(merged['sleep_score'] ??
        (deepMin > 0 ? Math.min(100, Math.round((deepMin / Math.max(deepMin + lightMin + remMin, 1)) * 100)) : 0));

      return {
        heartRate: Math.round(merged['heart_rate'] ?? 0),
        hrv:       Math.round(merged['hrv']        ?? 0),
        spo2:      Math.round(merged['spo2']        ?? 0),
        skinTemp:  Number((merged['skin_temp']      ?? 0).toFixed(1)),
        sleepScore,
        sleepStages: {
          deep:  `${Math.floor(deepMin / 60)}h ${deepMin % 60}m`,
          light: `${Math.floor(lightMin / 60)}h ${lightMin % 60}m`,
          rem:   `${Math.floor(remMin / 60)}h ${remMin % 60}m`,
        },
        steps:    Math.round(merged['steps']    ?? 0),
        calories: Math.round(merged['calories'] ?? 0),
        strain:   Number((merged['strain']      ?? 0).toFixed(1)),
        stress:   Math.round(merged['stress']   ?? 0),
        battery:  Math.round(merged['battery']  ?? 0),
        lastActive,
      };
    } catch (e) {
      this.logger.warn(`getLatestVitals failed for user ${userId}: ${e}`);
      return defaults;
    }
  }
}
