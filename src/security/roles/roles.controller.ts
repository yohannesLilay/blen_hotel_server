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
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('add_role')
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions('view_role')
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get('template')
  @Permissions('add_role')
  async template() {
    return await this.rolesService.template();
  }

  @Get(':id')
  @Permissions('view_role')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_role')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    if (id != updateRoleDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions('delete_role')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.remove(+id);
  }
}
