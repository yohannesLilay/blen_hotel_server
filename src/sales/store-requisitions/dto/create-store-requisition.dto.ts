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
import { UniqueStoreRequisitionNumberValidator } from '../validators/unique-store-requisition-number.validator';

class StoreRequisitionItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsInt()
  @IsNotEmpty()
  @Validate(ValidProductValidator)
  product_id: number;
}

export class CreateStoreRequisitionDto {
  @IsString()
  @IsNotEmpty()
  @Validate(UniqueStoreRequisitionNumberValidator)
  store_requisition_number: string;

  @IsDateString()
  @IsNotEmpty()
  store_requisition_date: Date;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StoreRequisitionItemDto)
  @ArrayMinSize(1, { message: 'At least one item is required' })
  items: StoreRequisitionItemDto[];
}
