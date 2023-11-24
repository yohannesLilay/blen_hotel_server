import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Permissions('add_room')
  async create(@Body() createRoomDto: CreateRoomDto) {
    return await this.roomsService.create(createRoomDto);
  }

  @Get('template')
  @Permissions('add_room')
  async template() {
    return await this.roomsService.template();
  }

  @Get()
  @Permissions('view_room')
  async findAll() {
    return await this.roomsService.findAll();
  }

  @Get(':id')
  @Permissions('view_room')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.roomsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_room')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    if (id != updateRoomDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.roomsService.update(+id, updateRoomDto);
  }

  @Patch(':id/toggle-status')
  @Permissions('change_room')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.roomsService.toggleStatus(+id);
  }

  @Patch(':id/toggle-availability')
  @Permissions('change_room')
  async toggleAvailability(@Param('id', ParseIntPipe) id: number) {
    return await this.roomsService.toggleAvailability(+id);
  }

  @Delete(':id')
  @Permissions('delete_room')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.roomsService.remove(+id);
  }
}
