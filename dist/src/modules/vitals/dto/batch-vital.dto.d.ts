export declare class VitalRecordDto {
    metricType: string;
    value: number;
    timestamp?: string;
    confidence?: number;
    deviceSerial?: string;
    extra?: Record<string, any>;
}
export declare class BatchVitalDto {
    records: VitalRecordDto[];
}
