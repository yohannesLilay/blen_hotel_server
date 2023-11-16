import { Module } from '@nestjs/common';
import { CaptainOrderService } from './captain-order.service';
import { CaptainOrderController } from './captain-order.controller';

@Module({
  controllers: [CaptainOrderController],
  providers: [CaptainOrderService],
})
export class CaptainOrderModule {}
