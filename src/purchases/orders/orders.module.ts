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

/** Custom Validators */
import { ValidProductValidator } from './validators/valid-product.validator';

/** Gateways */
import { WebSocketsGateway } from 'src/web-sockets/web-sockets.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductsModule,
    NotificationsModule,
    WorkFlowsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ValidProductValidator, WebSocketsGateway],
  exports: [OrdersService],
})
export class OrdersModule {}
