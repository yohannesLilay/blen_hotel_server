import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { RolesService } from 'src/security/roles/roles.service';

@ValidatorConstraint({ name: 'validRoles', async: true })
@Injectable()
export class ValidRolesValidator implements ValidatorConstraintInterface {
  constructor(private readonly rolesService: RolesService) {}

  async validate(roles: number[]) {
    if (!roles || roles.length === 0) return false;

    const existingRoles = await this.rolesService.findAll();
    const existingRoleIds = existingRoles.map((role) => role.id);

    return roles.every((id) => existingRoleIds.includes(id));
  }

  defaultMessage() {
    return `One or more role IDs are invalid or do not exist.`;
  }
}
