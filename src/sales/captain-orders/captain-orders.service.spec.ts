import { Test, TestingModule } from '@nestjs/testing';
import { CaptainOrdersService } from './captain-orders.service';

describe('CaptainOrdersService', () => {
  let service: CaptainOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaptainOrdersService],
    }).compile();

    service = module.get<CaptainOrdersService>(CaptainOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
