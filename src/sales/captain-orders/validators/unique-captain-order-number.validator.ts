import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { CaptainOrdersService } from '../captain-orders.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueCaptainOrderNumber', async: true })
export class UniqueCaptainOrderNumberValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly captainOrdersService: CaptainOrdersService) {}

  async validate(
    captainOrderNumber: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const id = (args.object as any).id;

    const captainOrder =
      await this.captainOrdersService.findByCaptainOrderNumber(
        captainOrderNumber,
      );
    if (!captainOrder) return true;

    return captainOrder.id === id;
  }

  defaultMessage() {
    return 'Captain Order Number already exists.';
  }
}
