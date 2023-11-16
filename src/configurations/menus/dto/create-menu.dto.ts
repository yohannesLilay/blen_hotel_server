import {
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { UniqueItemValidator } from '../validators/unique-item.validator';

export class CreateMenuDto {
  @IsNotEmpty()
  @IsString()
  @Validate(UniqueItemValidator)
  item: string;

  @IsNotEmpty()
  @IsDecimal()
  price: number;

  @IsOptional()
  @IsString()
  description?: string;
}
