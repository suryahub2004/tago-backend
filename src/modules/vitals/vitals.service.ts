import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { BatchVitalDto } from './dto/batch-vital.dto';
import { InfluxDBService } from '../influxdb/influxdb.service';
import { RedisService } from '../redis/redis.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class VitalsService {
  private readonly logger = new Logger(VitalsService.name);

  constructor(
    @InjectQueue('vitals-queue') private vitalsQueue: Queue,
    private influxDB: InfluxDBService,
    private redisService: RedisService,
  ) {}

  async processBatch(userId: string, dto: BatchVitalDto) {
    if (dto.records.length > 500) {
      throw new BadRequestException('Max 500 records per request');
    }

    await this.vitalsQueue.add('process-vitals', {
      userId,
      records: dto.records,
    });

    return { accepted: dto.records.length, queued: true };
  }

  /**
   * Returns a flat map of the latest vital readings for the given period.
   * Keys match what Flutter's unifiedVitalsProvider expects:
   *   avgHr, spo2, avgHrv, steps, strain, skinTemp, sleepScore, stress, calories, distance, battery
   */
  async getSummary(userId: string, period: string = 'today') {
    let rangeStart = '-24h';
    if (period === 'week' || period === '7d') rangeStart = '-7d';
    if (period === 'month' || period === '30d') rangeStart = '-30d';

    // Use the InfluxDBService helper which returns a flat map
    try {
      const latest = await this.influxDB.getLatestVitals(userId);
      return {
        avgHr:       latest.heartRate,
        avgHrv:      latest.hrv,
        spo2:        latest.spo2,
        skinTemp:    latest.skinTemp,
        sleepScore:  latest.sleepScore,
        steps:       latest.steps,
        calories:    latest.calories,
        strain:      latest.strain,
        stress:      latest.stress,
        battery:     latest.battery,
        lastActive:  latest.lastActive,
        // minHr as an approximation for resting HR — ideally you'd compute
        // the overnight minimum; for now use a fixed discount from avg
        minHr: latest.heartRate > 0 ? Math.max(latest.heartRate - 8, 40) : 0,
      };
    } catch (e) {
      this.logger.warn(`getSummary failed for ${userId}: ${e}`);
      return { avgHr: 0, avgHrv: 0, spo2: 0, skinTemp: 0, sleepScore: 0, steps: 0, calories: 0, strain: 0, stress: 0, battery: 0, minHr: 0 };
    }
  }

  /**
   * Returns time-series data for a specific metric over the given period.
   * Returns a PLAIN ARRAY (not wrapped in {data:[...]}) to match Flutter's getList() call.
   */
  async getHistory(
    userId: string,
    metric: string,
    period: string = '7d',
  ) {
    let rangeStart = '-7d';
    if (period === 'today' || period === '24h') rangeStart = '-24h';
    if (period === 'month' || period === '30d') rangeStart = '-30d';

    // Map Flutter metric names to InfluxDB field names
    const fieldMap: Record<string, string> = {
      heart_rate: 'value',
      hrv: 'value',
      spo2: 'value',
      steps: 'value',
      resting_hr: 'value',
      skin_temp: 'value',
      calories: 'value',
      strain: 'value',
      stress: 'value',
    };
    const field = fieldMap[metric] || 'value';

    const fluxQuery = `
      from(bucket: "${this.influxDB.bucket}")
        |> range(start: ${rangeStart})
        |> filter(fn: (r) => r["user_id"] == "${userId}")
        |> filter(fn: (r) => r["metric_type"] == "${metric}")
        |> filter(fn: (r) => r["_field"] == "${field}")
        |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
        |> yield(name: "mean")
    `;

    try {
      const results: { value: number; time: string }[] = [];
      for await (const { values, tableMeta } of this.influxDB.queryApi.iterateRows(fluxQuery)) {
        const o = tableMeta.toObject(values);
        if (o._value !== undefined && o._value !== null) {
          results.push({ value: Number(o._value.toFixed(1)), time: o._time });
        }
      }
      // Return plain array — Flutter uses getList() on this endpoint
      return results;
    } catch (e) {
      this.logger.warn(`getHistory failed for ${userId}/${metric}: ${e}`);
      return [];
    }
  }

  /**
   * Daily or weekly health report — aggregates all metrics from InfluxDB.
   * Called by GET /vitals/report?period=daily|weekly
   */
  async getReport(userId: string, period: 'daily' | 'weekly' = 'daily') {
    const rangeStart = period === 'weekly' ? '-7d' : '-24h';
    const label = period === 'weekly' ? 'Last 7 Days' : 'Today';

    try {
      // Aggregate each metric over the period
      const fluxQuery = `
        from(bucket: "${this.influxDB.bucket}")
          |> range(start: ${rangeStart})
          |> filter(fn: (r) => r["user_id"] == "${userId}")
          |> filter(fn: (r) => r["_measurement"] == "health_metrics")
          |> filter(fn: (r) => r["_field"] == "value")
          |> group(columns: ["metric_type"])
          |> mean()
      `;

      const metrics: Record<string, number> = {};
      for await (const { values, tableMeta } of this.influxDB.queryApi.iterateRows(fluxQuery)) {
        const o = tableMeta.toObject(values);
        if (o.metric_type && o._value !== undefined) {
          metrics[o.metric_type] = Number(Number(o._value).toFixed(1));
        }
      }

      // Steps: sum (not mean) over the period
      const stepsQuery = `
        from(bucket: "${this.influxDB.bucket}")
          |> range(start: ${rangeStart})
          |> filter(fn: (r) => r["user_id"] == "${userId}")
          |> filter(fn: (r) => r["metric_type"] == "steps")
          |> filter(fn: (r) => r["_field"] == "value")
          |> sum()
      `;
      for await (const { values, tableMeta } of this.influxDB.queryApi.iterateRows(stepsQuery)) {
        const o = tableMeta.toObject(values);
        if (o._value !== undefined) metrics['steps'] = Math.round(o._value);
      }

      const avgHr    = metrics['heart_rate'] ?? 0;
      const avgHrv   = metrics['hrv']        ?? 0;
      const avgSpo2  = metrics['spo2']       ?? 0;
      const steps    = metrics['steps']      ?? 0;
      const calories = metrics['calories']   ?? 0;
      const stress   = metrics['stress']     ?? 0;
      const sleepScore = metrics['sleep_score'] ?? 0;
      const skinTemp = metrics['skin_temp']  ?? 0;

      // Step goal: 10000/day
      const dayCount = period === 'weekly' ? 7 : 1;
      const stepGoal = 10000 * dayCount;
      const stepGoalPct = stepGoal > 0 ? Math.round((steps / stepGoal) * 100) : 0;

      // HRV trend: compare last 3d vs prior 4d (weekly only)
      let hrvTrend = 0;
      if (period === 'weekly' && avgHrv > 0) {
        try {
          const recentHrvQuery = `
            from(bucket: "${this.influxDB.bucket}")
              |> range(start: -3d)
              |> filter(fn: (r) => r["user_id"] == "${userId}" and r["metric_type"] == "hrv" and r["_field"] == "value")
              |> mean()
          `;
          for await (const { values, tableMeta } of this.influxDB.queryApi.iterateRows(recentHrvQuery)) {
            const o = tableMeta.toObject(values);
            if (o._value !== undefined) {
              hrvTrend = Number((o._value - avgHrv).toFixed(1));
            }
          }
        } catch { /* non-fatal */ }
      }

      return {
        period,
        label,
        generatedAt: new Date().toISOString(),
        metrics: {
          avgHeartRate:    avgHr,
          avgHrv:          avgHrv,
          hrvTrend:        hrvTrend,  // positive = improving
          avgSpo2:         avgSpo2,
          totalSteps:      steps,
          stepGoal:        stepGoal,
          stepGoalPct:     Math.min(stepGoalPct, 999),
          totalCalories:   calories,
          avgStress:       stress,
          sleepScore:      sleepScore,
          skinTemp:        skinTemp,
        },
      };
    } catch (e) {
      this.logger.warn(`getReport failed for ${userId}: ${e}`);
      return {
        period,
        label,
        generatedAt: new Date().toISOString(),
        metrics: {
          avgHeartRate: 0, avgHrv: 0, hrvTrend: 0, avgSpo2: 0,
          totalSteps: 0, stepGoal: 10000, stepGoalPct: 0,
          totalCalories: 0, avgStress: 0, sleepScore: 0, skinTemp: 0,
        },
      };
    }
  }

  /**
   * 7-day rolling average of HRV, resting HR, sleep score, and strain
   * to compute a "Recovery Forecast" readiness score (0–100).
   */
  async getReadinessForecast(userId: string): Promise<{
    readinessScore: number;
    trend: string;
    explanation: string;
  }> {
    try {
      const query = `
        from(bucket: "${this.influxDB.bucket}")
          |> range(start: -7d)
          |> filter(fn: (r) => r["user_id"] == "${userId}")
          |> filter(fn: (r) => r["_field"] == "value")
          |> filter(fn: (r) =>
               r["metric_type"] == "hrv" or
               r["metric_type"] == "heart_rate" or
               r["metric_type"] == "sleep_score" or
               r["metric_type"] == "strain")
          |> group(columns: ["metric_type"])
          |> mean()
      `;

      const metrics: Record<string, number> = {};
      for await (const { values, tableMeta } of this.influxDB.queryApi.iterateRows(query)) {
        const o = tableMeta.toObject(values);
        if (o.metric_type && o._value !== undefined) {
          metrics[o.metric_type] = Number(o._value);
        }
      }

      const hrv        = metrics['hrv']          ?? 0;
      const restingHr  = metrics['heart_rate']   ?? 0;
      const sleepScore = metrics['sleep_score']  ?? 0;
      const strain     = metrics['strain']       ?? 0;

      let score = 50; // baseline
      // HRV contribution (higher is better): 0–40 points
      if (hrv > 0) score += Math.min(40, (hrv / 100) * 40);
      // Resting HR contribution (lower is better): 0–20 points
      if (restingHr > 0) score += Math.max(0, 20 - ((restingHr - 50) * 0.5));
      // Sleep contribution: 0–20 points
      if (sleepScore > 0) score += (sleepScore / 100) * 20;
      // Strain penalty: subtract up to 30 points for high strain
      if (strain > 0) score -= Math.min(30, (strain / 21) * 30);

      score = Math.max(0, Math.min(100, Math.round(score)));

      const trend = hrv > 50 ? 'improving' : hrv > 30 ? 'stable' : 'declining';
      const explanation =
        score >= 75 ? 'High readiness — great day for intense training.' :
        score >= 50 ? 'Moderate readiness — light to moderate activity recommended.' :
        'Low readiness — prioritize recovery and light movement.';

      return { readinessScore: score, trend, explanation };
    } catch (e) {
      return { readinessScore: 50, trend: 'stable', explanation: 'Insufficient data for forecast.' };
    }
  }

  async getTrends(userId: string, metric: string, days: number) {
    // Real implementation using getHistory
    const history = await this.getHistory(userId, metric, `${days}d`);
    return { data: history };
  }

  async getCorrelations(userId: string) {
    // Simple insight strings — could be ML-powered in future
    return {
      insights: [
        'Higher HRV on days with 7+ hours of sleep.',
        'SpO2 remains stable across all activity levels.',
        'Step count above 8000 correlates with better sleep score.',
      ],
    };
  }

  async getWellnessSummary(userId: string) {
    const report = await this.getReport(userId, 'weekly');
    
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620';

    if (!anthropicApiKey) {
      return { summary: "We're unable to generate a wellness summary at this time as the AI service is not configured." };
    }

    const systemPrompt = `You are a personalized health AI assistant. Generate a short, 3-paragraph personalized health digest based on the user's past 7 days of vitals. Be direct, encouraging, and actionable. Provide the summary as plain text.`;
    
    const userPrompt = `
      Here are the 7-day average vitals for the user:
      - Average Heart Rate: ${report.metrics.avgHeartRate} bpm
      - Average HRV: ${report.metrics.avgHrv} ms
      - Average SpO2: ${report.metrics.avgSpo2}%
      - Total Steps: ${report.metrics.totalSteps}
      - Total Calories: ${report.metrics.totalCalories}
      - Sleep Score: ${report.metrics.sleepScore}
      - Stress Level: ${report.metrics.avgStress}
      - Skin Temperature: ${report.metrics.skinTemp}

      Please provide the 3-paragraph health digest.
    `;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      const summary = data.content[0].text;
      return { summary };
    } catch (error) {
      this.logger.warn(`Failed to generate wellness summary for ${userId}: ${error}`);
      return { summary: "We're currently unable to generate your personalized health digest. Please check back later." };
    }
  }
}
