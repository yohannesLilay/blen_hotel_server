import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { UniqueNameValidator } from '../validators/unique-name.validator';
import { ValidCategoryValidator } from '../validators/valid-category.validator';

export class CreateInventoryDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must have at least 2 characters.' })
  @MaxLength(100, { message: 'Name must have at most 100 characters.' })
  @Validate(UniqueNameValidator)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Validate(ValidCategoryValidator)
  categoryId: number;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Description must have at most 200 characters.' })
  description?: string;
}
