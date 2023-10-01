import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

/** DTOs */
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

/** Entities */
import { Permission } from './entities/permission.entity';

/** Constants */
import { seedPermissions } from './const/permissions';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async findByIds(permissionIds: number[]): Promise<Permission[]> {
    return await this.permissionRepository.findBy({ id: In(permissionIds) });
  }

  async findOne(id: number): Promise<Permission> {
    return await this.permissionRepository.findOneBy({ id });
  }

  async findByCodeName(codeName: string): Promise<Permission> {
    return await this.permissionRepository.findOne({
      where: { code_name: codeName },
    });
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(id);
    if (!permission) throw new NotFoundException('Permission not found.');

    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    if (!permission) throw new NotFoundException('Permission not found.');

    await this.permissionRepository.remove(permission);
  }

  async seed(): Promise<void> {
    const existingPermissions = await this.permissionRepository.find({
      where: {
        code_name: In(
          seedPermissions.map((permission) => permission.code_name),
        ),
      },
    });

    const permissionsToInsert = seedPermissions.filter((permissionToCreate) => {
      return !existingPermissions.some(
        (existingPermission) =>
          existingPermission.code_name === permissionToCreate.code_name,
      );
    });

    if (permissionsToInsert.length > 0) {
      const createdPermissions = await Promise.all(
        permissionsToInsert.map((permission) =>
          this.permissionRepository.create(permission),
        ),
      );
      await this.permissionRepository.save(createdPermissions);
      console.log(
        `${createdPermissions.length} permissions seeded successfully.`,
      );
    } else {
      console.log('No new permissions to seed.');
    }
  }
}
