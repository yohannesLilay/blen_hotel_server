import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { RolesService } from './roles.service';

/** Controllers */
import { RolesController } from './roles.controller';

/** Entities */
import { Role } from './entities/role.entity';

/** Custom Validators */
import { UniqueNameValidator } from './validators/unique-name.validator';
import { ValidPermissionsValidator } from './validators/valid-permissions.validator';

/** Modules */
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule],
  controllers: [RolesController],
  providers: [RolesService, UniqueNameValidator, ValidPermissionsValidator],
  exports: [RolesService],
})
export class RolesModule {}
