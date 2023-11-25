import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { BookRoomsService } from './book-rooms.service';
import { CreateBookRoomDto } from './dto/create-book-room.dto';
import { UpdateBookRoomDto } from './dto/update-book-room.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';
import { User } from 'src/security/auth/decorators/user.decorator';

/** Constants */
import { RoomType } from 'src/configurations/rooms/constants/room_type.enum';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('book-rooms')
export class BookRoomsController {
  constructor(private readonly bookRoomsService: BookRoomsService) {}

  @Post()
  @Permissions('add_book_room')
  async create(
    @Body() createBookRoomDto: CreateBookRoomDto,
    @User('id') userId: number,
  ) {
    return await this.bookRoomsService.create(createBookRoomDto, userId);
  }

  @Get()
  @Permissions('view_book_room')
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('date') date: string | undefined,
  ) {
    return await this.bookRoomsService.findAll(Math.max(page, 1), limit, date);
  }

  @Get('template')
  @Permissions('add_book_room')
  async template(@Query('room_type') roomType: RoomType) {
    return await this.bookRoomsService.template(roomType);
  }

  @Get(':id')
  @Permissions('view_book_room')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.bookRoomsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_book_room')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookRoomDto: UpdateBookRoomDto,
  ) {
    if (id != updateBookRoomDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.bookRoomsService.update(+id, updateBookRoomDto);
  }

  @Patch(':id/free-room')
  @Permissions('change_book_room')
  async freeRoom(@Param('id', ParseIntPipe) id: number) {
    return await this.bookRoomsService.freeRoom(+id);
  }

  @Delete(':id')
  @Permissions('delete_book_room')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.bookRoomsService.remove(+id);
  }
}
