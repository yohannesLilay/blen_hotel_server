import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { PasswordMatchesValidator } from '../validators/password-matches.validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  current_password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  new_password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Validate(PasswordMatchesValidator)
  confirm_password: string;
}
