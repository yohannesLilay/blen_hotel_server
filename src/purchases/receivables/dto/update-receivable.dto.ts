import { PartialType } from '@nestjs/swagger';
import { CreateReceivableDto } from './create-receivable.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateReceivableDto extends PartialType(CreateReceivableDto) {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
