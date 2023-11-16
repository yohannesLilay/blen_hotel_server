import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCaptainOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
