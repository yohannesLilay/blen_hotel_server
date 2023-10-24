import { Test, TestingModule } from '@nestjs/testing';
import { WorkFlowsController } from './work-flows.controller';
import { WorkFlowsService } from './work-flows.service';

describe('WorkFlowsController', () => {
  let controller: WorkFlowsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkFlowsController],
      providers: [WorkFlowsService],
    }).compile();

    controller = module.get<WorkFlowsController>(WorkFlowsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
