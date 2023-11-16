import { Module } from '@nestjs/common';
import { StoreRequisitionsModule } from './store-requisitions/store-requisitions.module';
import { CaptainOrdersModule } from './captain-orders/captain-orders.module';

@Module({
  imports: [StoreRequisitionsModule, CaptainOrdersModule],
  providers: [],
  exports: [StoreRequisitionsModule, CaptainOrdersModule],
})
export class SalesModule {}
