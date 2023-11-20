import { Test, TestingModule } from '@nestjs/testing';
import { CashReceiptsService } from './cash-receipts.service';

describe('CashReceiptsService', () => {
  let service: CashReceiptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashReceiptsService],
    }).compile();

    service = module.get<CashReceiptsService>(CashReceiptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
