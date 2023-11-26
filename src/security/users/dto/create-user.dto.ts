import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsPhoneNumber,
  Matches,
  IsString,
  Validate,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';
import { Gender } from '../constants/gender.enum';
import { UniqueEmailValidator } from '../validators/unique-email.validator';
import { UniquePhoneNumberValidator } from '../validators/unique-phone-number.validator';
import { ValidRolesValidator } from '../validators/valid-roles.validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Validate(UniqueEmailValidator)
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber('ET')
  @Matches(/^\+251\d{9}$/, { message: 'Phone number is not valid.' })
  @Validate(UniquePhoneNumberValidator)
  phone_number: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
  //   message: 'Password too weak',
  // })
  password: string;

  @IsNotEmpty({ message: 'Roles are required' })
  @IsArray({ message: 'Roles must be an array' })
  @ArrayNotEmpty({ message: 'Roles array cannot be empty' })
  @ArrayUnique({ message: 'Roles array cannot contain duplicate values' })
  @IsInt({ each: true, message: 'Each role ID must be an integer' })
  @Min(1, { each: true, message: 'Each role ID must be at least 1' })
  @Validate(ValidRolesValidator)
  roles: number[];
}
