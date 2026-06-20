import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateBroadcastDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  title: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  body: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsEnum(['info', 'warning', 'update', 'maintenance'])
  type: string;

  @IsBoolean()
  isDismissable: boolean;

  @IsOptional()
  @IsString()
  actionLabel?: string;

  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @IsEnum(['all', 'ring_users', 'band_users'])
  targetSegment: string;
}
