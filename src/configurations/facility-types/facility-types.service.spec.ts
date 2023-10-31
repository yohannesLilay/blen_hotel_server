import { Test, TestingModule } from '@nestjs/testing';
import { FacilityTypesService } from './facility-types.service';

describe('FacilityTypesService', () => {
  let service: FacilityTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacilityTypesService],
    }).compile();

    service = module.get<FacilityTypesService>(FacilityTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
