import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { InfluxDBService } from '../influxdb/influxdb.service';
import { Point } from '@influxdata/influxdb-client';
import { Logger } from '@nestjs/common';
import { KafkaProducer } from '../../kafka/kafka.producer';
import { KAFKA_TOPICS } from '../../kafka/topics';
import { v4 as uuid } from 'uuid';

@Processor('vitals-queue')
export class VitalsProcessor {
  private readonly logger = new Logger(VitalsProcessor.name);

  constructor(
    private influxDB: InfluxDBService,
    private kafkaProducer: KafkaProducer,
  ) {}

  @Process('process-vitals')
  async handleProcessVitals(job: Job<any>): Promise<any> {
    const { userId, records } = job.data;
    this.logger.debug(
      `Processing vitals batch for user ${userId}, size: ${records.length}`,
    );

    for (const record of records) {
      const point = new Point('health_metrics')
        .tag('user_id', userId)
        .tag('device_id', record.deviceSerial)
        .tag('metric_type', record.metricType)
        .floatField('value', record.value)
        .floatField('confidence', record.confidence)
        .timestamp(new Date(record.timestamp)); // Assuming ms timestamp

      this.influxDB.writeApi.writePoint(point);
    }

    // Actually flush the batch
    await this.influxDB.writeApi.flush();
    this.logger.debug(`Flushed vitals to InfluxDB for user ${userId}`);

    // Fire event/alert evaluation (delegated to alerts module in the real app)
    const metricTypes = [
      ...new Set(records.map((r: any) => r.metricType)),
    ] as string[];
    const latestReadings: Record<string, number> = {};
    for (const record of records) {
      latestReadings[record.metricType] = record.value;
    }

    await this.kafkaProducer.publish(KAFKA_TOPICS.VITALS_BATCH_UPLOADED, {
      eventId: uuid(),
      occurredAt: new Date().toISOString(),
      version: '1.0',
      userId,
      deviceId: records[0]?.deviceSerial || 'unknown',
      deviceType: 'UNKNOWN', // Ideally fetched from DB
      readingsCount: records.length,
      metricTypes,
      latestReadings,
    });

    return { success: true, count: records.length };
  }
}
