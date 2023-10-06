import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
