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
import { WebSocketsModule } from 'src/web-sockets/web-sockets.module';

/** Custom Validators */
import { ValidCaptainOrdersValidator } from './validators/valid-captain-orders.validator';
import { ValidStaffValidator } from './validators/valid-staff.validator';
import { ValidMenuValidator } from './validators/valid-menu.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashReceipt, CashReceiptItem]),
    MenusModule,
    CaptainOrdersModule,
    NotificationsModule,
    StaffsModule,
    RolesModule,
    WebSocketsModule,
  ],
  controllers: [CashReceiptsController],
  providers: [
    CashReceiptsService,
    ValidCaptainOrdersValidator,
    ValidStaffValidator,
    ValidMenuValidator,
  ],
  exports: [CashReceiptsService],
})
export class CashReceiptsModule {}
