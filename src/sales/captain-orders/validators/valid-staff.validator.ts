import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { StaffsService } from 'src/configurations/staffs/staffs.service';

@ValidatorConstraint({ name: 'validStaff', async: true })
@Injectable()
export class ValidStaffValidator implements ValidatorConstraintInterface {
  constructor(private readonly staffsService: StaffsService) {}

  async validate(staffId: number) {
    if (!staffId) return false;

    const staff = await this.staffsService.findOne(staffId);

    return !!staff;
  }

  defaultMessage() {
    return `The Staff ID is invalid or do not exist.`;
  }
}
