import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

/** DTOs */
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

/** Entities */
import { Role } from './entities/role.entity';

/** Services */
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });

    role.permissions = await this.permissionsService.findByIds(
      createRoleDto.permissions,
    );

    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({ relations: ['permissions'] });
  }

  async findByIds(roleIds: number[]): Promise<Role[]> {
    return await this.roleRepository.findBy({ id: In(roleIds) });
  }

  async template() {
    const permissions = await this.permissionsService.findAll();
    return {
      permissionOptions: permissions,
    };
  }

  async findOne(id: number): Promise<Role> {
    return await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findByName(name: string): Promise<Role> {
    return await this.roleRepository.findOne({
      where: { name: name },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (!role) throw new NotFoundException('Role not found.');

    role.name = updateRoleDto.name;
    role.description = updateRoleDto.description;
    role.permissions = await this.permissionsService.findByIds(
      updateRoleDto.permissions,
    );

    return await this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    if (!role) throw new NotFoundException('Role not found.');

    await this.roleRepository.remove(role);
  }

  async seed(): Promise<void> {
    let superAdminRole = await this.roleRepository.findOne({
      where: { name: 'SUPER ADMIN' },
    });

    if (!superAdminRole) {
      superAdminRole = this.roleRepository.create({
        name: 'SUPER ADMIN',
        description: 'Super administrator role with all permissions',
      });
      superAdminRole.permissions = await this.permissionsService.findAll();
    } else {
      superAdminRole.permissions = await this.permissionsService.findAll();
    }

    await this.roleRepository.save(superAdminRole);
    console.log('Role seeded successfully.');
  }
}
