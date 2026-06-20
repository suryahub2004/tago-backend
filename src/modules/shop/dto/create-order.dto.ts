import {
  IsString,
  IsInt,
  Min,
  IsOptional,
  ValidateNested,
  IsEnum,
  MinLength,
  IsMobilePhone,
  Length,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsMobilePhone('en-IN')
  phone: string;

  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  @Length(6, 6)
  pinCode: string;
}

export class CreateOrderDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  ringSize?: string;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsEnum(['COD', 'ONLINE'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
