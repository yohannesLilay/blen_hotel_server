import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { UniqueNameValidator } from '../validators/unique-name.validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must have at least 2 characters.' })
  @MaxLength(100, { message: 'Name must have at most 100 characters.' })
  @Validate(UniqueNameValidator)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Description must have at most 200 characters.' })
  description?: string;
}
