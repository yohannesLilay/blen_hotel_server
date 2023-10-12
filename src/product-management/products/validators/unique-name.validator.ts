import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { ProductsService } from '../products.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueName', async: true })
export class UniqueNameValidator implements ValidatorConstraintInterface {
  constructor(private readonly productsService: ProductsService) {}

  async validate(name: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const product = await this.productsService.findByName(name);
    if (!product) return true;

    return product.id === id;
  }

  defaultMessage() {
    return 'Product Name already exists.';
  }
}
