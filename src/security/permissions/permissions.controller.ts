import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('add_permission')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Permissions('view_permission')
  async findAll() {
    return await this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions('view_permission')
  async findOne(@Param('id') id: string) {
    return await this.permissionsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_permission')
  async update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    if (id != updatePermissionDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions('delete_permission')
  async remove(@Param('id') id: number) {
    return await this.permissionsService.remove(+id);
  }
}
