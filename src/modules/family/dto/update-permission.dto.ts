import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiProperty({ example: 'FULL' })
  @IsString()
  @IsIn(['STANDARD', 'FULL', 'LIMITED'])
  permissionLevel: string;
}
