import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { CashReceiptsService } from './cash-receipts.service';

/** Controllers */
import { CashReceiptsController } from './cash-receipts.controller';

/** Entities */
import { CashReceipt } from './entities/cash-receipt.entity';
import { CashReceiptItem } from './entities/cash-receipt-item.entity';

/** Modules */
import { MenusModule } from 'src/configurations/menus/menus.module';
import { CaptainOrdersModule } from '../captain-orders/captain-orders.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { StaffsModule } from 'src/configurations/staffs/staffs.module';
import { RolesModule } from 'src/security/roles/roles.module';

/** Custom Validators */
import { UniqueCashReceiptNumberValidator } from './validators/unique-cash-receipt-number.validator';
import { ValidCaptainOrdersValidator } from './validators/valid-captain-orders.validator';
import { ValidStaffValidator } from './validators/valid-staff.validator';
import { ValidMenuValidator } from './validators/valid-menu.validator';

/** Gateways */
import { WebSocketsGateway } from 'src/web-sockets/web-sockets.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashReceipt, CashReceiptItem]),
    MenusModule,
    CaptainOrdersModule,
    NotificationsModule,
    StaffsModule,
    RolesModule,
  ],
  controllers: [CashReceiptsController],
  providers: [
    CashReceiptsService,
    UniqueCashReceiptNumberValidator,
    ValidCaptainOrdersValidator,
    ValidStaffValidator,
    ValidMenuValidator,
    WebSocketsGateway,
  ],
  exports: [CashReceiptsService],
})
export class CashReceiptsModule {}
