import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { SuppliersService } from '../suppliers.service';

@Injectable()
@ValidatorConstraint({ name: 'uniquePhoneNumber', async: true })
export class UniquePhoneNumberValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly suppliersService: SuppliersService) {}

  async validate(
    phoneNumber: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const id = (args.object as any).id;

    const supplier = await this.suppliersService.findByPhoneNumber(phoneNumber);
    if (!supplier) return true;

    return supplier.id === id;
  }

  defaultMessage() {
    return 'Phone Number already exists.';
  }
}
