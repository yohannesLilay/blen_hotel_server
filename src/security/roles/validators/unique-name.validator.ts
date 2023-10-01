import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { RolesService } from '../roles.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueName', async: true })
export class UniqueNameValidator implements ValidatorConstraintInterface {
  constructor(private readonly rolesService: RolesService) {}

  async validate(Name: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const role = await this.rolesService.findByName(Name);
    if (!role) return true;

    return role.id === id;
  }

  defaultMessage() {
    return 'Name already exists.';
  }
}
