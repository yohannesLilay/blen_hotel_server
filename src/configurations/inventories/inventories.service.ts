import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/** DTOs */
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

/** Services */
import { CategoriesService } from '../categories/categories.service';

/** Entities */
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoriesService {
  constructor(
    @InjectRepository(Inventory)
    private readonly subLocationRepository: Repository<Inventory>,
    private readonly inventoriesService: CategoriesService,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const subLocation = this.subLocationRepository.create({
      name: createInventoryDto.name,
      description: createInventoryDto.description,
    });

    subLocation.category = await this.inventoriesService.findOne(
      createInventoryDto.categoryId,
    );

    return await this.subLocationRepository.save(subLocation);
  }

  async findAll(): Promise<Inventory[]> {
    return await this.subLocationRepository.find({ relations: ['category'] });
  }

  async template() {
    const inventories = await this.inventoriesService.findAll();
    return { categoryOptions: inventories };
  }

  async findOne(id: number): Promise<Inventory> {
    return await this.subLocationRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findByName(name: string): Promise<Inventory> {
    return await this.subLocationRepository.findOne({ where: { name } });
  }

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    const subLocation = await this.findOne(id);
    if (!subLocation) throw new NotFoundException('Sub Location not found.');

    subLocation.name = updateInventoryDto.name;
    subLocation.description = updateInventoryDto.description;
    subLocation.category = await this.inventoriesService.findOne(
      updateInventoryDto.categoryId,
    );

    return await this.subLocationRepository.save(subLocation);
  }

  async remove(id: number): Promise<void> {
    const subLocation = await this.findOne(id);
    if (!subLocation) throw new NotFoundException('Sub Location not found.');

    await this.subLocationRepository.remove(subLocation);
  }
}
