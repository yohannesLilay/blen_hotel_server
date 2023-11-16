import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { FacilityTypesService } from 'src/configurations/facility-types/facility-types.service';

@ValidatorConstraint({ name: 'validFacilityType', async: true })
@Injectable()
export class ValidFacilityTypeValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly facilityTypesService: FacilityTypesService) {}

  async validate(facilityTypeId: number) {
    if (!facilityTypeId) return false;

    const facilityType =
      await this.facilityTypesService.findOne(facilityTypeId);

    return !!facilityType;
  }

  defaultMessage() {
    return `The Facility Type ID is invalid or do not exist.`;
  }
}
