import { Injectable } from '@nestjs/common';
import { CreateWorkFlowDto } from './dto/create-work-flow.dto';
import { UpdateWorkFlowDto } from './dto/update-work-flow.dto';

@Injectable()
export class WorkFlowsService {
  create(createWorkFlowDto: CreateWorkFlowDto) {
    return 'This action adds a new workFlow';
  }

  findAll() {
    return `This action returns all workFlows`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workFlow`;
  }

  update(id: number, updateWorkFlowDto: UpdateWorkFlowDto) {
    return `This action updates a #${id} workFlow`;
  }

  remove(id: number) {
    return `This action removes a #${id} workFlow`;
  }
}
