import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { StoreRequisitionsService } from '../store-requisitions.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueStoreRequisitionNumber', async: true })
export class UniqueStoreRequisitionNumberValidator
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly storeRequisitionsService: StoreRequisitionsService,
  ) {}

  async validate(
    storeRequisitionNumber: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const id = (args.object as any).id;

    const storeRequisition =
      await this.storeRequisitionsService.findByStoreRequisitionNumber(
        storeRequisitionNumber,
      );
    if (!storeRequisition) return true;

    return storeRequisition.id === id;
  }

  defaultMessage() {
    return 'Store Requisition Number already exists.';
  }
}
