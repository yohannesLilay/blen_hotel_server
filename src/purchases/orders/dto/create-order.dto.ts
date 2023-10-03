import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { UniqueOrderNumberValidator } from '../validators/unique-order-number.validator';
import { ValidProductValidator } from '../validators/valid-product.validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unit_price: number;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsInt()
  @IsNotEmpty()
  @Validate(ValidProductValidator)
  product_id: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @Validate(UniqueOrderNumberValidator)
  order_number: string;

  @IsDateString()
  @IsNotEmpty()
  order_date: Date;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
