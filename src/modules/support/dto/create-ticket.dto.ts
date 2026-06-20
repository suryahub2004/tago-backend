import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority: string;

  @IsString()
  @IsIn(['technical', 'billing', 'general', 'device'])
  category: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
