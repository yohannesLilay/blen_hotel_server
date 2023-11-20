import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class SearchCashReceiptDto {
  @IsOptional()
  @IsString()
  cash_receipt_number?: string;

  @IsOptional()
  @IsDateString()
  cash_receipt_date?: Date;

  @IsOptional()
  @IsInt()
  casher?: number;

  @IsOptional()
  @IsInt()
  waiter?: number;
}
