import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { OrdersService } from './orders.service';

/** Controllers */
import { OrdersController } from './orders.controller';

/** Entities */
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

/** Modules */
import { UsersModule } from 'src/security/users/users.module';
import { ProductsModule } from 'src/product-management/products/products.module';

/** Custom Validators */
import { UniqueOrderNumberValidator } from './validators/unique-order-number.validator';
import { ValidProductValidator } from './validators/valid-product.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    UsersModule,
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, UniqueOrderNumberValidator, ValidProductValidator],
  exports: [OrdersService],
})
export class OrdersModule {}
