import {
  IsEnum,
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
import { UnitOfMeasure } from '../constants/unit-of-measure.enum';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must have at least 2 characters.' })
  @MaxLength(100, { message: 'Name must have at most 100 characters.' })
  @Validate(UniqueNameValidator)
  name: string;

  @IsNotEmpty()
  @IsEnum(UnitOfMeasure)
  unit_of_measure: UnitOfMeasure;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Validate(ValidCategoryValidator)
  categoryId: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  safety_stock_level?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Notes must have at most 200 characters.' })
  notes?: string;
}
