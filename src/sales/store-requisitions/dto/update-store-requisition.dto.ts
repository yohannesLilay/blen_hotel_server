import { PartialType } from '@nestjs/swagger';
import { CreateStoreRequisitionDto } from './create-store-requisition.dto';

export class UpdateStoreRequisitionDto extends PartialType(CreateStoreRequisitionDto) {}
