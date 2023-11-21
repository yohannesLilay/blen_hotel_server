import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { CaptainOrdersService } from 'src/sales/captain-orders/captain-orders.service';

@ValidatorConstraint({ name: 'validCaptainOrders', async: true })
@Injectable()
export class ValidCaptainOrdersValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly captainOrdersService: CaptainOrdersService) {}

  async validate(captainOrderIDs: number[]) {
    if (!captainOrderIDs || captainOrderIDs.length === 0) return false;

    const existingCaptainOrders =
      await this.captainOrdersService.findByIds(captainOrderIDs);

    const allExist = captainOrderIDs.every((id) =>
      existingCaptainOrders.some((captainOrder) => captainOrder.id === id),
    );

    return allExist;
  }

  defaultMessage() {
    return `One or more captain order IDs are invalid or do not exist.`;
  }
}
