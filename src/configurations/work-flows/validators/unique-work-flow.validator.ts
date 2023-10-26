import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { WorkFlowsService } from '../work-flows.service';
import { FlowStep } from '../constants/flow-step.enum';

@Injectable()
@ValidatorConstraint({ name: 'uniqueWorkFlow', async: true })
export class UniqueWorkFlowValidator implements ValidatorConstraintInterface {
  constructor(private readonly workFlowsService: WorkFlowsService) {}

  async validate(step: FlowStep, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;
    const flowType = (args.object as any).flow_type;

    const workFlow = await this.workFlowsService.findByFlowTypeAndStep(
      flowType,
      step,
    );
    if (!workFlow) return true;

    return workFlow.id === id;
  }

  defaultMessage() {
    return 'Work Flow with this flow type & step already exists.';
  }
}
