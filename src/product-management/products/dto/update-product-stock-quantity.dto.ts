import { IsEnum, IsInt, IsNotEmpty, Validate } from 'class-validator';
import { ValidProductValidator } from '../validators/valid-product.validator';
import { ProductStockOperation } from '../constants/product-stock-operation.enum';

export class UpdateProductsStockQuantityDto {
  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsNotEmpty()
  @IsInt()
  @Validate(ValidProductValidator)
  product_id: number;

  @IsNotEmpty()
  @IsEnum(ProductStockOperation)
  operation: ProductStockOperation;
}
