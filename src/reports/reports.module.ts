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
import { BookRoomsModule } from 'src/reservations/book-rooms/book-rooms.module';
import { StaffsModule } from 'src/configurations/staffs/staffs.module';
import { CashReceiptsModule } from 'src/sales/cash-receipts/cash-receipts.module';
import { MenusModule } from 'src/configurations/menus/menus.module';

@Module({
  imports: [
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    ReceivablesModule,
    BookRoomsModule,
    StaffsModule,
    CashReceiptsModule,
    MenusModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
