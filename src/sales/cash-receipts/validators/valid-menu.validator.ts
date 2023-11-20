import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { MenusService } from 'src/configurations/menus/menus.service';

@ValidatorConstraint({ name: 'validMenu', async: true })
@Injectable()
export class ValidMenuValidator implements ValidatorConstraintInterface {
  constructor(private readonly menusService: MenusService) {}

  async validate(menuId: number) {
    if (!menuId) return false;

    const menu = await this.menusService.findOne(menuId);

    return !!menu;
  }

  defaultMessage() {
    return `The Menu ID is invalid or do not exist.`;
  }
}
