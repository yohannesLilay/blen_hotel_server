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
import { ProductsModule } from 'src/product-management/products/products.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { WorkFlowsModule } from 'src/configurations/work-flows/work-flows.module';
import { WebSocketsModule } from 'src/web-sockets/web-sockets.module';

/** Custom Validators */
import { ValidProductValidator } from './validators/valid-product.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductsModule,
    NotificationsModule,
    WorkFlowsModule,
    WebSocketsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ValidProductValidator],
  exports: [OrdersService],
})
export class OrdersModule {}
