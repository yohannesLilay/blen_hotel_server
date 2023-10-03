import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { Request } from 'express';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';
import { OrderStatus } from './constants/OrderStatus.enum';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Permissions('add_order')
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    return await this.ordersService.create(createOrderDto, req.user['sub']);
  }

  @Get()
  @Permissions('view_order')
  async findAll() {
    return await this.ordersService.findAll();
  }

  @Get('template')
  @Permissions('add_order')
  async template() {
    return await this.ordersService.template();
  }

  @Get(':id')
  @Permissions('view_order')
  async findOne(@Param('id') id: number) {
    return await this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_order')
  async update(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    if (id != updateOrderDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.ordersService.updateOrder(+id, updateOrderDto);
  }

  @Patch(':id/items/:item_id')
  @Permissions('change_order')
  async updateOrderItem(
    @Param('item_id') item_id: number,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return await this.ordersService.updateOrderItem(
      +item_id,
      updateOrderItemDto,
    );
  }

  @Patch(':id/change-status')
  @Permissions('change_order')
  async updateOrderStatus(
    @Param('id') id: number,
    @Query('command') command: OrderStatus,
    @Req() req: Request,
  ) {
    return await this.ordersService.updateOrderStatus(
      +id,
      command,
      req.user['sub'],
    );
  }

  @Delete(':id')
  @Permissions('delete_order')
  async remove(@Param('id') id: number) {
    return await this.ordersService.remove(+id);
  }
}
