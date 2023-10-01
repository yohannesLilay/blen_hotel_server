import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { PermissionsService } from './permissions.service';

/** Controllers */
import { PermissionsController } from './permissions.controller';

/** Entities */
import { Permission } from './entities/permission.entity';

/** Custom Validators */
import { UniqueCodeNameValidator } from './validators/unique-code-name.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsController],
  providers: [PermissionsService, UniqueCodeNameValidator],
  exports: [PermissionsService],
})
export class PermissionsModule {}
