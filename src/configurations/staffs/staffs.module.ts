import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { StaffsService } from './staffs.service';

/** Controllers */
import { StaffsController } from './staffs.controller';

/** Entities */
import { Staff } from './entities/staff.entity';

/** Custom Validators */
import { UniquePhoneNumberValidator } from './validators/unique-phone-number.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  controllers: [StaffsController],
  providers: [StaffsService, UniquePhoneNumberValidator],
  exports: [StaffsService],
})
export class StaffsModule {}
