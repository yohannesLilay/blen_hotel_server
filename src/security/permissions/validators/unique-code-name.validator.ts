import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { PermissionsService } from '../permissions.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueCodeName', async: true })
export class UniqueCodeNameValidator implements ValidatorConstraintInterface {
  constructor(private readonly permissionsService: PermissionsService) {}

  async validate(
    codeName: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const id = (args.object as any).id;

    const permission = await this.permissionsService.findByCodeName(codeName);
    if (!permission) return true;

    return permission.id === id;
  }

  defaultMessage() {
    return 'Code name already exists.';
  }
}
