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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('add_user')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @Permissions('view_user')
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('template')
  @Permissions('add_user')
  async template() {
    return await this.usersService.template();
  }

  @Get(':id')
  @Permissions('view_user')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_user')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (id != updateUserDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.usersService.update(+id, updateUserDto);
  }

  @Patch(':id/toggle-status')
  @Permissions('change_user')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.toggleStatus(+id);
  }

  @Delete(':id')
  @Permissions('delete_user')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(+id);
  }
}
