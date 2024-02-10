import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOrderDto {
  @IsString()
  @IsNotEmpty()
  rejection_reason?: string;
}
