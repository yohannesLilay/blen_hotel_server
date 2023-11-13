import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { ValidProductValidator } from '../validators/valid-product.validator';

export class CreateStoreRequisitionItemDto {
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
