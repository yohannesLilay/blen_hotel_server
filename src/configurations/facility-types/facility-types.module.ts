import { Module } from '@nestjs/common';
import { FacilityTypesService } from './facility-types.service';
import { FacilityTypesController } from './facility-types.controller';

@Module({
  controllers: [FacilityTypesController],
  providers: [FacilityTypesService],
})
export class FacilityTypesModule {}
