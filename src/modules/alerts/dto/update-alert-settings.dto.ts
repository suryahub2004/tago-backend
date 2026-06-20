import { IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAlertSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  thresholds?: Record<string, number>;
}
