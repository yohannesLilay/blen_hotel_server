import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
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
}
