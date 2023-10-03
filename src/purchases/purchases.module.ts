import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [],
  exports: [OrdersModule],
})
export class PurchasesModule {}
