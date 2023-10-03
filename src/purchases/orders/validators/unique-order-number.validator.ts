import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { OrdersService } from '../orders.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueOrderNumber', async: true })
export class UniqueOrderNumberValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly ordersService: OrdersService) {}

  async validate(
    orderNumber: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const id = (args.object as any).id;

    const order = await this.ordersService.findByOrderNumber(orderNumber);
    if (!order) return true;

    return order.id === id;
  }

  defaultMessage() {
    return 'Order Number already exists.';
  }
}
