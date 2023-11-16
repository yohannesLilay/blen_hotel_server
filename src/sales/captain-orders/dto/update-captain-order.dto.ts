import { PartialType } from '@nestjs/swagger';
import { CreateCaptainOrderDto } from './create-captain-order.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateCaptainOrderDto extends PartialType(CreateCaptainOrderDto) {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
