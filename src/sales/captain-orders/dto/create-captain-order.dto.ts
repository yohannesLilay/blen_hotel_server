import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ValidMenuValidator } from '../validators/valid-menu.validator';
import { ValidFacilityTypeValidator } from '../validators/valid-facility-type.validator';
import { ValidStaffValidator } from '../validators/valid-staff.validator';

class CaptainOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsInt()
  @IsNotEmpty()
  @Validate(ValidMenuValidator)
  menu_id: number;
}

export class CreateCaptainOrderDto {
  @IsDateString()
  @IsNotEmpty()
  captain_order_date: Date;

  @IsInt()
  @IsNotEmpty()
  @Validate(ValidStaffValidator)
  waiter: number;

  @IsInt()
  @IsNotEmpty()
  @Validate(ValidFacilityTypeValidator)
  facility_type_id: number;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CaptainOrderItemDto)
  @ArrayMinSize(1, { message: 'At least one item is required' })
  items: CaptainOrderItemDto[];
}
