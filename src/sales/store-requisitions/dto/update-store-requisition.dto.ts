import { PartialType } from '@nestjs/swagger';
import { CreateStoreRequisitionDto } from './create-store-requisition.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateStoreRequisitionDto extends PartialType(
  CreateStoreRequisitionDto,
) {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
