import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { FacilityTypesService } from '../facility-types.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueName', async: true })
export class UniqueNameValidator implements ValidatorConstraintInterface {
  constructor(private readonly facilityTypesService: FacilityTypesService) {}

  async validate(name: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const facilityType = await this.facilityTypesService.findByName(name);
    if (!facilityType) return true;

    return facilityType.id === id;
  }

  defaultMessage() {
    return 'Facility Type Name already exists.';
  }
}
