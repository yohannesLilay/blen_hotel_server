import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { StoreRequisitionsService } from './store-requisitions.service';

/** Controllers */
import { StoreRequisitionsController } from './store-requisitions.controller';

/** Entities */
import { StoreRequisition } from './entities/store-requisition.entity';
import { StoreRequisitionItem } from './entities/store-requisition-item.entity';

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
    TypeOrmModule.forFeature([StoreRequisition, StoreRequisitionItem]),
    ProductsModule,
    NotificationsModule,
    WorkFlowsModule,
  ],
  controllers: [StoreRequisitionsController],
  providers: [
    StoreRequisitionsService,
    ValidProductValidator,
    WebSocketsGateway,
  ],
  exports: [StoreRequisitionsService],
})
export class StoreRequisitionsModule {}
