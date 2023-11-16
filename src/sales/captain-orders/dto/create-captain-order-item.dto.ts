import { IsInt, IsNotEmpty, IsNumber, Validate } from 'class-validator';
import { ValidMenuValidator } from '../validators/valid-menu.validator';

export class CreateCaptainOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsInt()
  @IsNotEmpty()
  @Validate(ValidMenuValidator)
  menu_id: number;
}
