import { Test, TestingModule } from '@nestjs/testing';
import { CaptainOrdersController } from './captain-orders.controller';
import { CaptainOrdersService } from './captain-orders.service';

describe('CaptainOrdersController', () => {
  let controller: CaptainOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaptainOrdersController],
      providers: [CaptainOrdersService],
    }).compile();

    controller = module.get<CaptainOrdersController>(CaptainOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
