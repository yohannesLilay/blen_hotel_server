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
import { StaffsService } from './staffs.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  @Post()
  @Permissions('add_staff')
  async create(@Body() createStaffDto: CreateStaffDto) {
    return await this.staffsService.create(createStaffDto);
  }

  @Get('template')
  @Permissions('add_staff')
  async template() {
    return await this.staffsService.template();
  }

  @Get()
  @Permissions('view_staff')
  async findAll() {
    return await this.staffsService.findAll();
  }

  @Get(':id')
  @Permissions('view_staff')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.staffsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_staff')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    if (id != updateStaffDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.staffsService.update(+id, updateStaffDto);
  }

  @Patch(':id/toggle-status')
  @Permissions('change_user')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.staffsService.toggleStatus(+id);
  }

  @Delete(':id')
  @Permissions('delete_staff')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.staffsService.remove(+id);
  }
}
