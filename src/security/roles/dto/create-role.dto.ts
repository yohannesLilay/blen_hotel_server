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
import { ValidPermissionsValidator } from '../validators/valid-permissions.validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must have at least 2 characters.' })
  @MaxLength(20, { message: 'Name must have at most 20 characters.' })
  @Validate(UniqueNameValidator)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Permissions are required' })
  @IsArray({ message: 'Permissions must be an array' })
  @ArrayNotEmpty({ message: 'Permissions array cannot be empty' })
  @ArrayUnique({ message: 'Permissions array cannot contain duplicate values' })
  @IsInt({ each: true, message: 'Each permission ID must be an integer' })
  @Min(1, { each: true, message: 'Each permission ID must be at least 1' })
  @Validate(ValidPermissionsValidator)
  permissions: number[];
}
