import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { ProductsService } from '../products.service';

@ValidatorConstraint({ name: 'validProduct', async: true })
@Injectable()
export class ValidProductValidator implements ValidatorConstraintInterface {
  constructor(private readonly productsService: ProductsService) {}

  async validate(productId: number) {
    if (!productId) return false;

    const product = await this.productsService.findOne(productId);

    return !!product;
  }

  defaultMessage() {
    return `The Product ID is invalid or do not exist.`;
  }
}
