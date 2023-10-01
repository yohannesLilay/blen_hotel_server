import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { SuppliersService } from '../suppliers.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueEmail', async: true })
export class UniqueEmailValidator implements ValidatorConstraintInterface {
  constructor(private readonly suppliersService: SuppliersService) {}

  async validate(email: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const supplier = await this.suppliersService.findByEmail(email);
    if (!supplier) return true;

    return supplier.id === id;
  }

  defaultMessage() {
    return 'Email already exists.';
  }
}
