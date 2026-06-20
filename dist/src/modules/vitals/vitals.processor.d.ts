import type { Job } from 'bull';
import { InfluxDBService } from '../influxdb/influxdb.service';
import { KafkaProducer } from '../../kafka/kafka.producer';
export declare class VitalsProcessor {
    private influxDB;
    private kafkaProducer;
    private readonly logger;
    constructor(influxDB: InfluxDBService, kafkaProducer: KafkaProducer);
    handleProcessVitals(job: Job<any>): Promise<any>;
}
