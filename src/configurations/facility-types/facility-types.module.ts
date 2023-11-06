import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { FacilityTypesService } from './facility-types.service';

/** Controllers */
import { FacilityTypesController } from './facility-types.controller';

/** Entity */
import { FacilityType } from './entities/facility-type.entity';

/** Modules */
import { RolesModule } from 'src/security/roles/roles.module';

/** Custom Validators */
import { UniqueNameValidator } from './validators/unique-name.validator';
import { ValidRolesValidator } from './validators/valid-roles.validator';

@Module({
  imports: [TypeOrmModule.forFeature([FacilityType]), RolesModule],
  controllers: [FacilityTypesController],
  providers: [FacilityTypesService, UniqueNameValidator, ValidRolesValidator],
  exports: [FacilityTypesService],
})
export class FacilityTypesModule {}
