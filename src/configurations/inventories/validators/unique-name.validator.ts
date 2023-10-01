import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { InventoriesService } from '../inventories.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueName', async: true })
export class UniqueNameValidator implements ValidatorConstraintInterface {
  constructor(private readonly inventoriesService: InventoriesService) {}

  async validate(name: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const inventory = await this.inventoriesService.findByName(name);
    if (!inventory) return true;

    return inventory.id === id;
  }

  defaultMessage() {
    return 'Inventory Name already exists.';
  }
}
