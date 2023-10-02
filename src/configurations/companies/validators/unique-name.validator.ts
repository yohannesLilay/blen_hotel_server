import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { CompaniesService } from '../companies.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueName', async: true })
export class UniqueNameValidator implements ValidatorConstraintInterface {
  constructor(private readonly companiesService: CompaniesService) {}

  async validate(name: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const company = await this.companiesService.findByName(name);
    if (!company) return true;

    return company.id === id;
  }

  defaultMessage() {
    return 'Company Name already exists.';
  }
}
