import { Module } from '@nestjs/common';
import { WorkFlowsService } from './work-flows.service';
import { WorkFlowsController } from './work-flows.controller';

@Module({
  controllers: [WorkFlowsController],
  providers: [WorkFlowsService],
})
export class WorkFlowsModule {}
