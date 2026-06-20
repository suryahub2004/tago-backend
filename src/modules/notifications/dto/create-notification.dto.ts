import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'ALERT' })
  @IsEnum(['INFO', 'ALERT', 'PROMO', 'SYSTEM'])
  type: string;

  @ApiProperty({ example: 'High Heart Rate' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your heart rate exceeded 130 bpm.' })
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;
}
