import { Injectable } from '@nestjs/common';
import { CreateFacilityTypeDto } from './dto/create-facility-type.dto';
import { UpdateFacilityTypeDto } from './dto/update-facility-type.dto';

@Injectable()
export class FacilityTypesService {
  create(createFacilityTypeDto: CreateFacilityTypeDto) {
    return 'This action adds a new facilityType';
  }

  findAll() {
    return `This action returns all facilityTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facilityType`;
  }

  update(id: number, updateFacilityTypeDto: UpdateFacilityTypeDto) {
    return `This action updates a #${id} facilityType`;
  }

  remove(id: number) {
    return `This action removes a #${id} facilityType`;
  }
}
