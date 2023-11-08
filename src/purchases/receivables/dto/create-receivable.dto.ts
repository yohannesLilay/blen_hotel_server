import { Type } from 'class-transformer';
import {
  ArrayMinSize,
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
import { ValidProductValidator } from '../validators/valid-product.validator';
import { UniqueReceivableNumberValidator } from '../validators/unique-receivable-number.validator';
import { ValidOrderValidator } from '../validators/valid-order.validator';
import { ValidSupplierValidator } from '../validators/valid-supplier.validator';

class ReceivableItemDto {
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

export class CreateReceivableDto {
  @IsString()
  @IsNotEmpty()
  @Validate(UniqueReceivableNumberValidator)
  receivable_number: string;

  @IsDateString()
  @IsNotEmpty()
  receivable_date: Date;

  @IsOptional()
  @IsInt()
  @Validate(ValidOrderValidator)
  order_id?: number;

  @IsInt()
  @IsOptional()
  @Validate(ValidSupplierValidator)
  supplier_id?: number;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReceivableItemDto)
  @ArrayMinSize(1, { message: 'At least one item is required' })
  items: ReceivableItemDto[];
}
