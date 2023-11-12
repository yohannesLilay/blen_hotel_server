import { Module } from '@nestjs/common';
import { StoreRequisitionsService } from './store-requisitions.service';
import { StoreRequisitionsController } from './store-requisitions.controller';

@Module({
  controllers: [StoreRequisitionsController],
  providers: [StoreRequisitionsService],
})
export class StoreRequisitionsModule {}
