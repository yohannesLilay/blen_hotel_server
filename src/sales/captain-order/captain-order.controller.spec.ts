import { Test, TestingModule } from '@nestjs/testing';
import { CaptainOrderController } from './captain-order.controller';
import { CaptainOrderService } from './captain-order.service';

describe('CaptainOrderController', () => {
  let controller: CaptainOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaptainOrderController],
      providers: [CaptainOrderService],
    }).compile();

    controller = module.get<CaptainOrderController>(CaptainOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
