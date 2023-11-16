import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
