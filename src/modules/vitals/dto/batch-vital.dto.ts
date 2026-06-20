import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VitalRecordDto {
  @ApiProperty({ example: 'heart_rate' })
  @IsString()
  metricType: string;

  @ApiProperty({ example: 75.5 })
  @IsNumber()
  value: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiProperty({ example: 0.98, required: false })
  @IsOptional()
  @IsNumber()
  confidence?: number;

  @ApiProperty({ example: 'SN-RING-1234', required: false })
  @IsOptional()
  @IsString()
  deviceSerial?: string;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  extra?: Record<string, any>;
}

export class BatchVitalDto {
  @ApiProperty({ type: [VitalRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VitalRecordDto)
  records: VitalRecordDto[];
}
