import { Test, TestingModule } from '@nestjs/testing';
import { WorkFlowsService } from './work-flows.service';

describe('WorkFlowsService', () => {
  let service: WorkFlowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkFlowsService],
    }).compile();

    service = module.get<WorkFlowsService>(WorkFlowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
