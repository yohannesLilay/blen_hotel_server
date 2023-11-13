import { Test, TestingModule } from '@nestjs/testing';
import { StoreRequisitionsService } from './store-requisitions.service';

describe('StoreRequisitionsService', () => {
  let service: StoreRequisitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreRequisitionsService],
    }).compile();

    service = module.get<StoreRequisitionsService>(StoreRequisitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
