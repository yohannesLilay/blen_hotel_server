import { Test, TestingModule } from '@nestjs/testing';
import { FacilityTypesController } from './facility-types.controller';
import { FacilityTypesService } from './facility-types.service';

describe('FacilityTypesController', () => {
  let controller: FacilityTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityTypesController],
      providers: [FacilityTypesService],
    }).compile();

    controller = module.get<FacilityTypesController>(FacilityTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
