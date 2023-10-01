import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/** DTOs */
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

/** Entities */
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async findAll(): Promise<Supplier[]> {
    return await this.supplierRepository.find();
  }

  async findOne(id: number): Promise<Supplier> {
    return await this.supplierRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Supplier> {
    return await this.supplierRepository.findOne({ where: { email } });
  }

  async findByPhoneNumber(phone_number: string): Promise<Supplier> {
    return await this.supplierRepository.findOne({ where: { phone_number } });
  }

  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id);
    if (!supplier) throw new NotFoundException('Supplier not found.');

    Object.assign(supplier, updateSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async remove(id: number): Promise<void> {
    const supplier = await this.findOne(id);
    if (!supplier) throw new NotFoundException('Supplier not found.');

    await this.supplierRepository.remove(supplier);
  }
}
