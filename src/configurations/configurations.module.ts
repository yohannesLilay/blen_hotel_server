import { Module } from '@nestjs/common';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [SuppliersModule, CompaniesModule],
  providers: [],
  exports: [SuppliersModule, CompaniesModule],
})
export class ConfigurationsModule {}
