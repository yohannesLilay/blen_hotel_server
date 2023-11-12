import { Test, TestingModule } from '@nestjs/testing';
import { StoreRequisitionsController } from './store-requisitions.controller';
import { StoreRequisitionsService } from './store-requisitions.service';

describe('StoreRequisitionsController', () => {
  let controller: StoreRequisitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreRequisitionsController],
      providers: [StoreRequisitionsService],
    }).compile();

    controller = module.get<StoreRequisitionsController>(StoreRequisitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
