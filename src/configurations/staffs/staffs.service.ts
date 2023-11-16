import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/** DTOs */
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

/** Entities */
import { Staff } from './entities/staff.entity';

/** Enums */
import { StaffType } from './constants/staff-type.enum';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    const staff = this.staffRepository.create(createStaffDto);
    return await this.staffRepository.save(staff);
  }

  async findAll(): Promise<Staff[]> {
    return await this.staffRepository.find();
  }

  async findOne(id: number): Promise<Staff> {
    return await this.staffRepository.findOne({ where: { id } });
  }

  async findByPhoneNumber(phone_number: string): Promise<Staff> {
    return await this.staffRepository.findOne({ where: { phone_number } });
  }

  async template() {
    return { staffTypeOptions: StaffType };
  }

  async update(id: number, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(id);
    if (!staff) throw new NotFoundException('Staff not found.');

    Object.assign(staff, updateStaffDto);
    return await this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);
    if (!staff) throw new NotFoundException('Staff not found.');

    await this.staffRepository.remove(staff);
  }
}
