import { Module } from '@nestjs/common';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CompaniesModule } from './companies/companies.module';
import { WorkFlowsModule } from './work-flows/work-flows.module';
import { FacilityTypesModule } from './facility-types/facility-types.module';
import { MenusModule } from './menus/menus.module';
import { StaffsModule } from './staffs/staffs.module';

@Module({
  imports: [
    SuppliersModule,
    CompaniesModule,
    WorkFlowsModule,
    FacilityTypesModule,
    MenusModule,
    StaffsModule,
  ],
  providers: [],
  exports: [
    SuppliersModule,
    CompaniesModule,
    WorkFlowsModule,
    FacilityTypesModule,
    MenusModule,
    StaffsModule,
  ],
})
export class ConfigurationsModule {}
