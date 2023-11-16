import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { CaptainOrdersService } from './captain-orders.service';

/** Controllers */
import { CaptainOrdersController } from './captain-orders.controller';

/** Entities */
import { CaptainOrder } from './entities/captain-order.entity';
import { CaptainOrderItem } from './entities/captain-order-item.entity';

/** Modules */
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MenusModule } from 'src/configurations/menus/menus.module';
import { StaffsModule } from 'src/configurations/staffs/staffs.module';
import { FacilityTypesModule } from 'src/configurations/facility-types/facility-types.module';

/** Custom Validators */
import { UniqueCaptainOrderNumberValidator } from './validators/unique-captain-order-number.validator';
import { ValidMenuValidator } from './validators/valid-menu.validator';
import { ValidFacilityTypeValidator } from './validators/valid-facility-type.validator';
import { ValidStaffValidator } from './validators/valid-staff.validator';

/** Gateways */
import { WebSocketsGateway } from 'src/web-sockets/web-sockets.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([CaptainOrder, CaptainOrderItem]),
    NotificationsModule,
    MenusModule,
    StaffsModule,
    FacilityTypesModule,
  ],
  controllers: [CaptainOrdersController],
  providers: [
    CaptainOrdersService,
    UniqueCaptainOrderNumberValidator,
    ValidMenuValidator,
    ValidFacilityTypeValidator,
    ValidStaffValidator,
    WebSocketsGateway,
  ],
  exports: [CaptainOrdersService],
})
export class CaptainOrdersModule {}
