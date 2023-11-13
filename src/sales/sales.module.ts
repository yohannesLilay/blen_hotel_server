import { Module } from '@nestjs/common';
import { StoreRequisitionsModule } from './store-requisitions/store-requisitions.module';

@Module({
  imports: [StoreRequisitionsModule],
  providers: [],
  exports: [StoreRequisitionsModule],
})
export class SalesModule {}
