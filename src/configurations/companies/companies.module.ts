import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { CompaniesService } from './companies.service';

/** Controllers */
import { CompaniesController } from './companies.controller';

/** Entities */
import { Company } from './entities/company.entity';

/** Custom Validators */
import { UniqueNameValidator } from './validators/unique-name.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompaniesController],
  providers: [CompaniesService, UniqueNameValidator],
  exports: [CompaniesService],
})
export class CompaniesModule {}
