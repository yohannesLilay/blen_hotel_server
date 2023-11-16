import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { StaffsService } from '../staffs.service';

@Injectable()
@ValidatorConstraint({ name: 'uniquePhoneNumber', async: true })
export class UniquePhoneNumberValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly staffsService: StaffsService) {}

  async validate(
    phoneNumber: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const id = (args.object as any).id;

    const staff = await this.staffsService.findByPhoneNumber(phoneNumber);
    if (!staff) return true;

    return staff.id === id;
  }

  defaultMessage() {
    return 'Phone Number already exists.';
  }
}
