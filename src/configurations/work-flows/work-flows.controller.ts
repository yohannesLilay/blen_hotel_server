import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkFlowsService } from './work-flows.service';
import { CreateWorkFlowDto } from './dto/create-work-flow.dto';
import { UpdateWorkFlowDto } from './dto/update-work-flow.dto';

@Controller('work-flows')
export class WorkFlowsController {
  constructor(private readonly workFlowsService: WorkFlowsService) {}

  @Post()
  create(@Body() createWorkFlowDto: CreateWorkFlowDto) {
    return this.workFlowsService.create(createWorkFlowDto);
  }

  @Get()
  findAll() {
    return this.workFlowsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workFlowsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkFlowDto: UpdateWorkFlowDto) {
    return this.workFlowsService.update(+id, updateWorkFlowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workFlowsService.remove(+id);
  }
}
