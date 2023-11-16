import { Module } from '@nestjs/common';
import { StoreRequisitionsModule } from './store-requisitions/store-requisitions.module';
import { CaptainOrderModule } from './captain-order/captain-order.module';

@Module({
  imports: [StoreRequisitionsModule, CaptainOrderModule],
  providers: [],
  exports: [StoreRequisitionsModule, CaptainOrderModule],
})
export class SalesModule {}
