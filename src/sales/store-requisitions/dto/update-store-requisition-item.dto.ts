import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStoreRequisitionItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  remark?: string;
}
