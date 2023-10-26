import { Module } from '@nestjs/common';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CompaniesModule } from './companies/companies.module';
import { WorkFlowsModule } from './work-flows/work-flows.module';

@Module({
  imports: [SuppliersModule, CompaniesModule, WorkFlowsModule],
  providers: [],
  exports: [SuppliersModule, CompaniesModule, WorkFlowsModule],
})
export class ConfigurationsModule {}
