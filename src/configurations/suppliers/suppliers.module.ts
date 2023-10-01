import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { SuppliersService } from './suppliers.service';

/** Controllers */
import { SuppliersController } from './suppliers.controller';

/** Entities */
import { Supplier } from './entities/supplier.entity';

/** Custom Validators */
import { UniqueEmailValidator } from './validators/unique-email.validator';
import { UniquePhoneNumberValidator } from './validators/unique-phone-number.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [
    SuppliersService,
    UniqueEmailValidator,
    UniquePhoneNumberValidator,
  ],
  exports: [SuppliersService],
})
export class SuppliersModule {}
