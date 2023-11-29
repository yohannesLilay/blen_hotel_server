import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { ReceivablesService } from './receivables.service';

/** Controllers */
import { ReceivablesController } from './receivables.controller';

/** Entities */
import { Receivable } from './entities/receivable.entity';
import { ReceivableItem } from './entities/receivable-item.entity';

/** Modules */
import { SuppliersModule } from 'src/configurations/suppliers/suppliers.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from 'src/product-management/products/products.module';
import { WorkFlowsModule } from 'src/configurations/work-flows/work-flows.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { WebSocketsModule } from 'src/web-sockets/web-sockets.module';

/** Custom Validator */
import { ValidOrderValidator } from './validators/valid-order.validator';
import { ValidProductValidator } from './validators/valid-product.validator';
import { ValidSupplierValidator } from './validators/valid-supplier.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receivable, ReceivableItem]),
    SuppliersModule,
    OrdersModule,
    ProductsModule,
    WorkFlowsModule,
    NotificationsModule,
    WebSocketsModule,
  ],
  controllers: [ReceivablesController],
  providers: [
    ReceivablesService,
    ValidOrderValidator,
    ValidProductValidator,
    ValidSupplierValidator,
  ],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
