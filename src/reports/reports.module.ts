import { Module } from '@nestjs/common';

/** Controllers */
import { ReportsController } from './reports.controller';

/** Services */
import { ReportsService } from './reports.service';

/** Modules */
import { CategoriesModule } from 'src/product-management/categories/categories.module';
import { ProductsModule } from 'src/product-management/products/products.module';
import { OrdersModule } from 'src/purchases/orders/orders.module';
import { ReceivablesModule } from 'src/purchases/receivables/receivables.module';

@Module({
  imports: [CategoriesModule, ProductsModule, OrdersModule, ReceivablesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
