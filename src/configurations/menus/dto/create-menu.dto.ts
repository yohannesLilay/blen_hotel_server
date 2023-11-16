import {
  IsNotEmpty,
  IsNumber,
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
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  description?: string;
}
