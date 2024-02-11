import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as XLSX from 'xlsx';

/** DTOs */
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

/** Entities */
import { Room } from './entities/room.entity';
import { RoomType } from './constants/room_type.enum';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(createRoomDto);
    return await this.roomRepository.save(room);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    rooms: Room[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [rooms, total] = await this.roomRepository.findAndCount({
      where: search ? [{ name: ILike(`%${search}%`) }] : {},
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { rooms, total, currentPage, totalPages };
  }

  async findAllActive(): Promise<Room[]> {
    return await this.roomRepository.find({ where: { status: true } });
  }

  async findAvailableRoomByRoomType(roomType: RoomType): Promise<Room[]> {
    return await this.roomRepository.find({
      where: { room_type: roomType, status: true, available: true },
    });
  }

  async findOne(id: number): Promise<Room> {
    return await this.roomRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Room> {
    return await this.roomRepository.findOne({ where: { name } });
  }

  async template() {
    return { roomTypeOptions: RoomType };
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) throw new NotFoundException('Room not found.');

    Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(room);
  }

  async toggleStatus(id: number): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) throw new NotFoundException('Room not found.');

    room.status = !room.status;

    return await this.roomRepository.save(room);
  }

  async toggleAvailability(id: number): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) throw new NotFoundException('Room not found.');

    room.available = !room.available;

    return await this.roomRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    if (!room) throw new NotFoundException('Room not found.');

    await this.roomRepository.remove(room);
  }

  async importExcel(file: Express.Multer.File): Promise<Room[]> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const expectedHeaders = ['name', 'price', 'type', 'notes'];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
    });

    if (!jsonData.length) {
      throw new HttpException(
        'No data found in the worksheet',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (
      !expectedHeaders.every((header) => jsonData[0].hasOwnProperty(header))
    ) {
      throw new HttpException(
        'Expected headers are missing in the Excel file',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    for (const row of jsonData) {
      const name = row['name'].trim();
      const price = row['price'];

      this.validateField(name, 'Room name can not be empty or null.');

      if (await this.doesRoomExist(name)) {
        throw new HttpException(
          `Room with name '${name}' already exists.`,
          HttpStatus.CONFLICT,
        );
      }

      if (price !== null && price !== undefined && price !== '') {
        const priceNumber = parseFloat(price);
        if (isNaN(priceNumber)) {
          throw new HttpException(
            'Room price must be a valid number.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

      // Modify the row to use the Room model
      row['price'] = price ? price : 0;
      row['name'] = name;
      row['type'] = row['type'] ? row['type'] : null;
      row['notes'] = row['notes'] ? row['notes'] : null;
    }

    return await this.roomRepository.save(jsonData);
  }

  async roomsCount() {
    return await this.roomRepository.count();
  }

  async doesRoomExist(name): Promise<boolean> {
    const room = await this.roomRepository.findOne({
      where: { name },
    });

    return !!room;
  }

  validateField(value, message) {
    if (!value) {
      throw new HttpException(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
