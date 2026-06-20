import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSimpleTicketDto {
  @ApiProperty({ example: 'My Smart Ring is not syncing' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'I have tried restarting the app, but it still does not sync.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
