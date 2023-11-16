import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { MenusService } from '../menus.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueItem', async: true })
export class UniqueItemValidator implements ValidatorConstraintInterface {
  constructor(private readonly menusService: MenusService) {}

  async validate(item: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const menu = await this.menusService.findByItem(item);
    if (!menu) return true;

    return menu.id === id;
  }

  defaultMessage() {
    return 'Item already exists.';
  }
}
