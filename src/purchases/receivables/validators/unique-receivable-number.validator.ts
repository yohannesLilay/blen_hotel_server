import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { ReceivablesService } from '../receivables.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueReceivableNumber', async: true })
export class UniqueReceivableNumberValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly receivablesService: ReceivablesService) {}

  async validate(
    receivableNumber: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const id = (args.object as any).id;

    const receivable =
      await this.receivablesService.findByReceivableNumber(receivableNumber);
    if (!receivable) return true;

    return receivable.id === id;
  }

  defaultMessage() {
    return 'Receivable Number already exists.';
  }
}
