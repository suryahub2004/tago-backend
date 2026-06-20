import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHealthProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() age?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() height?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weight?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() bloodType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fitnessLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fitnessGoal?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sleepGoal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() stepsGoal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() caloriesGoal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() workoutDays?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredWorkouts?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() dietType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alcoholFrequency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() smokingStatus?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  onboardingComplete?: boolean;
}
