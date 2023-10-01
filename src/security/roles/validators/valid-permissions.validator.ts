import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { PermissionsService } from 'src/security/permissions/permissions.service';

@ValidatorConstraint({ name: 'validPermissions', async: true })
@Injectable()
export class ValidPermissionsValidator implements ValidatorConstraintInterface {
  constructor(private readonly permissionsService: PermissionsService) {}

  async validate(permissions: number[]) {
    if (!permissions || permissions.length === 0) return false;

    const existingPermissions = await this.permissionsService.findAll();
    const existingPermissionIds = existingPermissions.map(
      (permission) => permission.id,
    );

    return permissions.every((id) => existingPermissionIds.includes(id));
  }

  defaultMessage() {
    return `One or more permission IDs are invalid or do not exist.`;
  }
}
