import { Module } from '@nestjs/common';
import { StoreRequisitionsModule } from './store-requisitions/store-requisitions.module';
import { CaptainOrdersModule } from './captain-orders/captain-orders.module';
import { CashReceiptsModule } from './cash-receipts/cash-receipts.module';

@Module({
  imports: [StoreRequisitionsModule, CaptainOrdersModule, CashReceiptsModule],
  providers: [],
  exports: [StoreRequisitionsModule, CaptainOrdersModule, CashReceiptsModule],
})
export class SalesModule {}
