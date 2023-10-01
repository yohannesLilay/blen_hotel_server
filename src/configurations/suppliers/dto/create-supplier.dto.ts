import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  Validate,
} from 'class-validator';
import { UniqueEmailValidator } from '../validators/unique-email.validator';
import { UniquePhoneNumberValidator } from '../validators/unique-phone-number.validator';

export class CreateSupplierDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  @Validate(UniqueEmailValidator)
  email?: string;

  @IsNotEmpty()
  @IsPhoneNumber('ET')
  @Matches(/^\+251\d{9}$/, { message: 'Phone number is not valid.' })
  @Validate(UniquePhoneNumberValidator)
  phone_number: string;

  @IsOptional()
  @IsString()
  address?: string;
}
