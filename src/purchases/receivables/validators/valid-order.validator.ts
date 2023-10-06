import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { OrdersService } from 'src/purchases/orders/orders.service';

@ValidatorConstraint({ name: 'validOrder', async: true })
@Injectable()
export class ValidOrderValidator implements ValidatorConstraintInterface {
  constructor(private readonly ordersService: OrdersService) {}

  async validate(orderId: number) {
    if (!orderId) return false;

    const order = await this.ordersService.findOne(orderId);

    return !!order;
  }

  defaultMessage() {
    return `The Order ID is invalid or do not exist.`;
  }
}
