import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';

export class PairDeviceDto {
  @ApiProperty({ example: 'SN-RING-1234' })
  @IsString()
  deviceSerial: string;

  @ApiProperty({ enum: DeviceType })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiPropertyOptional({ example: 'My Smart Ring' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
