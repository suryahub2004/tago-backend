import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'some-refresh-token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
