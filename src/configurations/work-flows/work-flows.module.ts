import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { WorkFlowsService } from './work-flows.service';

/** Controllers */
import { WorkFlowsController } from './work-flows.controller';

/** Entities */
import { WorkFlow } from './entities/work-flow.entity';

/** Modules */
import { RolesModule } from 'src/security/roles/roles.module';

/** Custom Validators */
import { UniqueWorkFlowValidator } from './validators/unique-work-flow.validator';
import { ValidRolesValidator } from './validators/valid-roles.validator';

@Module({
  imports: [TypeOrmModule.forFeature([WorkFlow]), RolesModule],
  controllers: [WorkFlowsController],
  providers: [WorkFlowsService, UniqueWorkFlowValidator, ValidRolesValidator],
  exports: [WorkFlowsService],
})
export class WorkFlowsModule {}
