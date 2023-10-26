import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  Validate,
} from 'class-validator';
import { FlowType } from '../constants/flow-type.enum';
import { FlowStep } from '../constants/flow-step.enum';
import { ValidRolesValidator } from '../validators/valid-roles.validator';
import { UniqueWorkFlowValidator } from '../validators/unique-work-flow.validator';

export class CreateWorkFlowDto {
  @IsNotEmpty()
  @IsEnum(FlowType)
  flow_type: FlowType;

  @IsNotEmpty()
  @IsEnum(FlowStep)
  @Validate(UniqueWorkFlowValidator)
  step: FlowStep;

  @IsOptional()
  @IsArray({ message: 'Roles must be an array' })
  @ArrayNotEmpty({ message: 'Roles array cannot be empty' })
  @ArrayUnique({ message: 'Roles array cannot contain duplicate values' })
  @IsInt({ each: true, message: 'Each role ID must be an integer' })
  @Min(1, { each: true, message: 'Each role ID must be at least 1' })
  @Validate(ValidRolesValidator)
  notify_to: number[];
}
