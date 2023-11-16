import {
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  Validate,
} from 'class-validator';
import { StaffType } from '../constants/staff-type.enum';
import { UniquePhoneNumberValidator } from '../validators/unique-phone-number.validator';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber('ET')
  @Matches(/^\+251\d{9}$/, { message: 'Phone number is not valid.' })
  @Validate(UniquePhoneNumberValidator)
  phone_number: string;

  @IsNotEmpty()
  @IsEnum(StaffType)
  staff_type: StaffType;
}
