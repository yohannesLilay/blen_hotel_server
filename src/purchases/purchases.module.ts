import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { ReceivablesModule } from './receivables/receivables.module';

@Module({
  imports: [OrdersModule, ReceivablesModule],
  providers: [],
  exports: [OrdersModule, ReceivablesModule],
})
export class PurchasesModule {}
