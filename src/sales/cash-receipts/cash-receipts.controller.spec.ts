import { Test, TestingModule } from '@nestjs/testing';
import { CashReceiptsController } from './cash-receipts.controller';
import { CashReceiptsService } from './cash-receipts.service';

describe('CashReceiptsController', () => {
  let controller: CashReceiptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashReceiptsController],
      providers: [CashReceiptsService],
    }).compile();

    controller = module.get<CashReceiptsController>(CashReceiptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
