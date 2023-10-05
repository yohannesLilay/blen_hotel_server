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
import { CreateOrderItemDto } from './dto/create-order-item.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

/** Constants */
import { OrderStatus } from './constants/OrderStatus.enum';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('purchase-orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Permissions('add_purchase_order')
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    return await this.ordersService.create(createOrderDto, req.user['sub']);
  }

  @Post(':id')
  @Permissions('add_purchase_order')
  async createOrderItem(
    @Param('id') id: number,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ) {
    return await this.ordersService.createOrderItem(id, createOrderItemDto);
  }

  @Get()
  @Permissions('view_purchase_order')
  async findAll() {
    return await this.ordersService.findAll();
  }

  @Get('template')
  @Permissions('add_purchase_order')
  async template() {
    return await this.ordersService.template();
  }

  @Get(':id')
  @Permissions('view_purchase_order')
  async findOne(@Param('id') id: number) {
    return await this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_purchase_order')
  async update(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: Request,
  ) {
    if (id != updateOrderDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.ordersService.updateOrder(
      +id,
      updateOrderDto,
      req.user['sub'],
    );
  }

  @Patch(':id/items/:item_id')
  @Permissions('change_purchase_order')
  async updateOrderItem(
    @Param('id') id: number,
    @Param('item_id') item_id: number,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
    @Req() req: Request,
  ) {
    return await this.ordersService.updateOrderItem(
      +id,
      +item_id,
      updateOrderItemDto,
      req.user['sub'],
    );
  }

  @Patch(':id/change-status')
  @Permissions('change_purchase_order')
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
  @Permissions('delete_purchase_order')
  async remove(@Param('id') id: number, @Req() req: Request) {
    return await this.ordersService.remove(+id, req.user['sub']);
  }

  @Delete(':id/items/:item_id')
  @Permissions('delete_purchase_order')
  async removeOrderItem(
    @Param('id') id: number,
    @Param('item_id') item_id: number,
    @Req() req: Request,
  ) {
    return await this.ordersService.removeOrderItem(
      +id,
      +item_id,
      req.user['sub'],
    );
  }
}
