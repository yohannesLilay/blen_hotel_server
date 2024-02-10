import { IsNotEmpty, IsString } from 'class-validator';

export class RejectReceivableDto {
  @IsString()
  @IsNotEmpty()
  rejection_reason?: string;
}
