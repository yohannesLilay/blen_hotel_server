import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/** DTOs */
import { CreateWorkFlowDto } from './dto/create-work-flow.dto';
import { UpdateWorkFlowDto } from './dto/update-work-flow.dto';

/** Entity */
import { WorkFlow } from './entities/work-flow.entity';

/** Services */
import { RolesService } from 'src/security/roles/roles.service';

/** Constants */
import { FlowType } from './constants/flow-type.enum';
import { FlowStep } from './constants/flow-step.enum';

@Injectable()
export class WorkFlowsService {
  constructor(
    @InjectRepository(WorkFlow)
    private readonly workFlowRepository: Repository<WorkFlow>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createWorkFlowDto: CreateWorkFlowDto): Promise<WorkFlow> {
    const workFlow = this.workFlowRepository.create({
      flow_type: createWorkFlowDto.flow_type,
      step: createWorkFlowDto.step,
    });
    workFlow.notify_to = await this.rolesService.findByIds(
      createWorkFlowDto.notify_to,
    );

    return await this.workFlowRepository.save(workFlow);
  }

  async findAll(): Promise<WorkFlow[]> {
    return await this.workFlowRepository.find({
      relations: ['notify_to'],
    });
  }

  async template() {
    const roles = await this.rolesService.findAll();
    return {
      roleOptions: roles,
      flowTypeOptions: FlowType,
      flowStepOptions: FlowStep,
    };
  }

  async findOne(id: number): Promise<WorkFlow> {
    return await this.workFlowRepository.findOne({
      where: { id },
      relations: ['notify_to'],
    });
  }

  async findByFlowType(flowType: FlowType): Promise<WorkFlow> {
    return await this.workFlowRepository.findOne({
      where: { flow_type: flowType },
    });
  }

  async findByFlowTypeAndStep(
    flowType: FlowType,
    step: FlowStep,
  ): Promise<WorkFlow> {
    return await this.workFlowRepository.findOne({
      where: { flow_type: flowType, step: step },
      relations: ['notify_to'],
    });
  }

  async update(
    id: number,
    updateWorkFlowDto: UpdateWorkFlowDto,
  ): Promise<WorkFlow> {
    const workFlow = await this.findOne(id);
    if (!workFlow) throw new NotFoundException('WorkFlow not found.');

    workFlow.step = updateWorkFlowDto.step;
    workFlow.notify_to = await this.rolesService.findByIds(
      updateWorkFlowDto.notify_to,
    );

    return await this.workFlowRepository.save(workFlow);
  }

  async remove(id: number): Promise<void> {
    const workFlow = await this.findOne(id);
    if (!workFlow) throw new NotFoundException('Work Flow not found.');

    await this.workFlowRepository.remove(workFlow);
  }
}
