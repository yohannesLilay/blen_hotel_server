import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'passwordMatches', async: true })
export class PasswordMatchesValidator implements ValidatorConstraintInterface {
  async validate(
    confirmPassword: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const newPassword = (args.object as any).new_password;

    return newPassword === confirmPassword;
  }

  defaultMessage() {
    return 'Passwords do not match.';
  }
}
