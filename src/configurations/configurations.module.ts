import { Module } from '@nestjs/common';
import { SuppliersModule } from './suppliers/suppliers.module';
import { WorkFlowsModule } from './work-flows/work-flows.module';
import { FacilityTypesModule } from './facility-types/facility-types.module';
import { MenusModule } from './menus/menus.module';
import { StaffsModule } from './staffs/staffs.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    SuppliersModule,
    WorkFlowsModule,
    FacilityTypesModule,
    MenusModule,
    StaffsModule,
    RoomsModule,
  ],
  providers: [],
  exports: [
    SuppliersModule,
    WorkFlowsModule,
    FacilityTypesModule,
    MenusModule,
    StaffsModule,
    RoomsModule,
  ],
})
export class ConfigurationsModule {}
