import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { UsersService } from '../users.service';

@Injectable()
@ValidatorConstraint({ name: 'uniquePhoneNumber', async: true })
export class UniquePhoneNumberValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersService: UsersService) {}

  async validate(
    phoneNumber: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const id = (args.object as any).id;

    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (!user) return true;

    return user.id === id;
  }

  defaultMessage() {
    return 'Phone Number already exists.';
  }
}
