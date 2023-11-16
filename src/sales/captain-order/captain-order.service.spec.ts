import { Test, TestingModule } from '@nestjs/testing';
import { CaptainOrderService } from './captain-order.service';

describe('CaptainOrderService', () => {
  let service: CaptainOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaptainOrderService],
    }).compile();

    service = module.get<CaptainOrderService>(CaptainOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
