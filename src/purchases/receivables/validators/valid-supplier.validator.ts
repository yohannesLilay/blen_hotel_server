import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { SuppliersService } from 'src/configurations/suppliers/suppliers.service';

@ValidatorConstraint({ name: 'validSupplier', async: true })
@Injectable()
export class ValidSupplierValidator implements ValidatorConstraintInterface {
  constructor(private readonly suppliersService: SuppliersService) {}

  async validate(supplierId: number) {
    if (!supplierId) return false;

    const supplier = await this.suppliersService.findOne(supplierId);

    return !!supplier;
  }

  defaultMessage() {
    return `The Supplier ID is invalid or do not exist.`;
  }
}
