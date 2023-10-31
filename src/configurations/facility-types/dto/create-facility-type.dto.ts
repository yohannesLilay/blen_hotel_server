import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { UniqueNameValidator } from '../validators/unique-name.validator';
import { ValidRolesValidator } from '../validators/valid-roles.validator';

export class CreateFacilityTypeDto {
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

  @IsNotEmpty({ message: 'Roles are required' })
  @IsArray({ message: 'Roles must be an array' })
  @ArrayNotEmpty({ message: 'Roles array cannot be empty' })
  @ArrayUnique({ message: 'Roles array cannot contain duplicate values' })
  @IsInt({ each: true, message: 'Each role ID must be an integer' })
  @Min(1, { each: true, message: 'Each role ID must be at least 1' })
  @Validate(ValidRolesValidator)
  responsible_roles: number[];
}
