import { Module } from '@nestjs/common';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CompaniesModule } from './companies/companies.module';
import { WorkFlowsModule } from './work-flows/work-flows.module';
import { FacilityTypesModule } from './facility-types/facility-types.module';
import { MenusModule } from './menus/menus.module';

@Module({
  imports: [
    SuppliersModule,
    CompaniesModule,
    WorkFlowsModule,
    FacilityTypesModule,
    MenusModule,
  ],
  providers: [],
  exports: [
    SuppliersModule,
    CompaniesModule,
    WorkFlowsModule,
    FacilityTypesModule,
    MenusModule,
  ],
})
export class ConfigurationsModule {}
