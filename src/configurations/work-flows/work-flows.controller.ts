import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { WorkFlowsService } from './work-flows.service';
import { CreateWorkFlowDto } from './dto/create-work-flow.dto';
import { UpdateWorkFlowDto } from './dto/update-work-flow.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('work-flows')
export class WorkFlowsController {
  constructor(private readonly workFlowsService: WorkFlowsService) {}

  @Post()
  @Permissions('add_work_flow')
  async create(@Body() createWorkFlowDto: CreateWorkFlowDto) {
    return await this.workFlowsService.create(createWorkFlowDto);
  }

  @Get()
  @Permissions('view_work_flow')
  async findAll() {
    return await this.workFlowsService.findAll();
  }

  @Get('template')
  @Permissions('add_work_flow')
  async template() {
    return await this.workFlowsService.template();
  }

  @Get(':id')
  @Permissions('view_work_flow')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.workFlowsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_work_flow')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkFlowDto: UpdateWorkFlowDto,
  ) {
    if (id != updateWorkFlowDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.workFlowsService.update(+id, updateWorkFlowDto);
  }

  @Delete(':id')
  @Permissions('delete_work_flow')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.workFlowsService.remove(+id);
  }
}
