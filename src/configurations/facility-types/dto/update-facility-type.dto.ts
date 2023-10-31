import { PartialType } from '@nestjs/swagger';
import { CreateFacilityTypeDto } from './create-facility-type.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateFacilityTypeDto extends PartialType(CreateFacilityTypeDto) {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
