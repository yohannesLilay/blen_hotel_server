import {
  ArrayMinSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ValidMenuValidator } from '../validators/valid-menu.validator';
import { ValidStaffValidator } from '../validators/valid-staff.validator';
import { ValidCaptainOrdersValidator } from '../validators/valid-captain-orders.validator';

class CashReceiptItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unit_price: number;

  @IsInt()
  @IsNotEmpty()
  @Validate(ValidMenuValidator)
  menu_id: number;
}

export class CreateCashReceiptDto {
  @IsDateString()
  @IsNotEmpty()
  cash_receipt_date: Date;

  @IsInt()
  @IsNotEmpty()
  @Validate(ValidStaffValidator)
  waiter: number;

  @IsNotEmpty({ message: 'Captain Orders are required' })
  @IsArray({ message: 'Captain Orders must be an array' })
  @ArrayNotEmpty({ message: 'Captain Orders array cannot be empty' })
  @ArrayUnique({
    message: 'Captain Orders array cannot contain duplicate values',
  })
  @IsInt({ each: true, message: 'Each captain order ID must be an integer' })
  @Min(1, { each: true, message: 'Each captain order ID must be at least 1' })
  @Validate(ValidCaptainOrdersValidator)
  captain_order_ids: number[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CashReceiptItemDto)
  @ArrayMinSize(1, { message: 'At least one item is required' })
  items: CashReceiptItemDto[];
}
