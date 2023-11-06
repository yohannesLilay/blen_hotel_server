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

/** Custom Validator */
import { UniqueReceivableNumberValidator } from './validators/unique-receivable-number.validator';
import { ValidOrderValidator } from './validators/valid-order.validator';
import { ValidProductValidator } from './validators/valid-product.validator';
import { ValidSupplierValidator } from './validators/valid-supplier.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receivable, ReceivableItem]),
    SuppliersModule,
    OrdersModule,
    ProductsModule,
  ],
  controllers: [ReceivablesController],
  providers: [
    ReceivablesService,
    UniqueReceivableNumberValidator,
    ValidOrderValidator,
    ValidProductValidator,
    ValidSupplierValidator,
  ],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
