import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { CategoriesService } from 'src/product-management/categories/categories.service';

@ValidatorConstraint({ name: 'validCategory', async: true })
@Injectable()
export class ValidCategoryValidator implements ValidatorConstraintInterface {
  constructor(private readonly categoriesService: CategoriesService) {}

  async validate(categoryId: number) {
    if (!categoryId) return false;

    const category = await this.categoriesService.findOne(categoryId);

    return !!category;
  }

  defaultMessage() {
    return `The Category ID is invalid or do not exist.`;
  }
}
