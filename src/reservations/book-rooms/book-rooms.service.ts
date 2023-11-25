import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

/** DTOs */
import { CreateBookRoomDto } from './dto/create-book-room.dto';
import { UpdateBookRoomDto } from './dto/update-book-room.dto';

/** Entities */
import { BookRoom } from './entities/book-room.entity';

/** Services */
import { RoomsService } from 'src/configurations/rooms/rooms.service';
import { UsersService } from 'src/security/users/users.service';

/** Constants */
import { RoomType } from 'src/configurations/rooms/constants/room_type.enum';

@Injectable()
export class BookRoomsService {
  constructor(
    @InjectRepository(BookRoom)
    private readonly bookRoomRepository: Repository<BookRoom>,
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createBookRoomDto: CreateBookRoomDto,
    userId: number,
  ): Promise<BookRoom> {
    const bookRoom = this.bookRoomRepository.create({
      book_date: createBookRoomDto.book_date || new Date(),
      notes: createBookRoomDto.notes,
    });
    bookRoom.room = await this.roomsService.findOne(createBookRoomDto.room_id);
    bookRoom.operator = await this.usersService.findOne(userId);

    await this.roomsService.toggleAvailability(createBookRoomDto.room_id);

    return await this.bookRoomRepository.save(bookRoom);
  }

  async findAll(
    page: number,
    limit: number,
    date?: string,
  ): Promise<{
    bookRooms: BookRoom[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    let whereCondition = {};
    if (date) {
      const [day, month, year] = date.split('-');
      const isoDate = `${year}-${month}-${day}`;

      whereCondition = {
        book_date: Raw((alias) => `DATE(${alias}) = '${isoDate}'`),
      };
    }

    const [bookRooms, total] = await this.bookRoomRepository.findAndCount({
      relations: ['room', 'operator'],
      where: whereCondition,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { bookRooms, total, currentPage, totalPages };
  }

  async template(roomType: RoomType) {
    const availableRooms =
      await this.roomsService.findAvailableRoomByRoomType(roomType);
    return { roomOptions: availableRooms };
  }

  async findOne(id: number): Promise<BookRoom> {
    return await this.bookRoomRepository.findOne({
      where: { id },
      relations: ['room', 'operator'],
    });
  }

  async update(
    id: number,
    updateBookRoomDto: UpdateBookRoomDto,
  ): Promise<BookRoom> {
    const bookRoom = await this.findOne(id);
    if (!bookRoom) throw new NotFoundException('Book Room not found.');

    await this.roomsService.toggleAvailability(bookRoom.room.id);
    bookRoom.room = await this.roomsService.findOne(updateBookRoomDto.room_id);
    bookRoom.notes = updateBookRoomDto.notes;
    await this.roomsService.toggleAvailability(updateBookRoomDto.room_id);

    return await this.bookRoomRepository.save(bookRoom);
  }

  async remove(id: number): Promise<void> {
    const bookRoom = await this.findOne(id);
    if (!bookRoom) throw new NotFoundException('Book Room not found.');

    await this.bookRoomRepository.remove(bookRoom);
  }
}
