import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { UsersService } from 'src/security/users/users.service';

@ValidatorConstraint({ name: 'validRecipient', async: true })
@Injectable()
export class ValidRecipientValidator implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  async validate(recipient: number) {
    if (!recipient) return false;

    const user = await this.usersService.findOne(recipient);

    return !!user;
  }

  defaultMessage() {
    return `The Recipient is invalid or do not exist.`;
  }
}
