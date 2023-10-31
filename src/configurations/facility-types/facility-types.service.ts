import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/** DTOs */
import { CreateFacilityTypeDto } from './dto/create-facility-type.dto';
import { UpdateFacilityTypeDto } from './dto/update-facility-type.dto';

/** Entities */
import { FacilityType } from './entities/facility-type.entity';

/** Services */
import { RolesService } from 'src/security/roles/roles.service';

@Injectable()
export class FacilityTypesService {
  constructor(
    @InjectRepository(FacilityType)
    private readonly facilityTypeRepository: Repository<FacilityType>,
    private readonly rolesService: RolesService,
  ) {}

  async create(
    createFacilityTypeDto: CreateFacilityTypeDto,
  ): Promise<FacilityType> {
    const facilityType = this.facilityTypeRepository.create({
      name: createFacilityTypeDto.name,
      description: createFacilityTypeDto.description,
    });
    facilityType.responsible_roles = await this.rolesService.findByIds(
      createFacilityTypeDto.responsible_roles,
    );

    return await this.facilityTypeRepository.save(facilityType);
  }

  async findAll(): Promise<FacilityType[]> {
    return await this.facilityTypeRepository.find();
  }

  async findOne(id: number): Promise<FacilityType> {
    return await this.facilityTypeRepository.findOneBy({ id });
  }

  async findByName(name: string): Promise<FacilityType> {
    return await this.facilityTypeRepository.findOne({ where: { name } });
  }

  async template() {
    const roles = await this.rolesService.findAll();
    return {
      roleOptions: roles,
    };
  }

  async update(
    id: number,
    updateFacilityTypeDto: UpdateFacilityTypeDto,
  ): Promise<FacilityType> {
    const facilityType = await this.findOne(id);
    if (!facilityType) throw new NotFoundException('Facility Type not found.');

    facilityType.name = updateFacilityTypeDto.name;
    facilityType.description = updateFacilityTypeDto.description;
    facilityType.responsible_roles = await this.rolesService.findByIds(
      updateFacilityTypeDto.responsible_roles,
    );
    return await this.facilityTypeRepository.save(facilityType);
  }

  async remove(id: number): Promise<void> {
    const facilityType = await this.findOne(id);
    if (!facilityType) throw new NotFoundException('Facility Type not found.');

    await this.facilityTypeRepository.remove(facilityType);
  }
}
