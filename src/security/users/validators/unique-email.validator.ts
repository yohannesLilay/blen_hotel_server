import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { UsersService } from '../users.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueEmail', async: true })
export class UniqueEmailValidator implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  async validate(email: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const user = await this.usersService.findByEmail(email);
    if (!user) return true;

    return user.id === id;
  }

  defaultMessage() {
    return 'Email already exists.';
  }
}
