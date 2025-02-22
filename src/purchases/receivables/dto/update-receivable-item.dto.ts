import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReceivableItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unit_price: number;

  @IsString()
  @IsOptional()
  remark?: string;
}
