import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { CategoriesService } from '../categories.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueName', async: true })
export class UniqueNameValidator implements ValidatorConstraintInterface {
  constructor(private readonly categoriesService: CategoriesService) {}

  async validate(name: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const category = await this.categoriesService.findByName(name);
    if (!category) return true;

    return category.id === id;
  }

  defaultMessage() {
    return 'Category Name already exists.';
  }
}
