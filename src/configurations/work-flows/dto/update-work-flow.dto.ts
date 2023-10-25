import { PartialType } from '@nestjs/swagger';
import { CreateWorkFlowDto } from './create-work-flow.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateWorkFlowDto extends PartialType(CreateWorkFlowDto) {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
