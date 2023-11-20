import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { CashReceiptsService } from '../cash-receipts.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueCashReceiptNumber', async: true })
export class UniqueCashReceiptNumberValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly cashReceiptsService: CashReceiptsService) {}

  async validate(
    cashReceiptNumber: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const id = (args.object as any).id;

    const cashReceipt =
      await this.cashReceiptsService.findByCashReceiptNumber(cashReceiptNumber);
    if (!cashReceipt) return true;

    return cashReceipt.id === id;
  }

  defaultMessage() {
    return 'Cash Receipt Number already exists.';
  }
}
