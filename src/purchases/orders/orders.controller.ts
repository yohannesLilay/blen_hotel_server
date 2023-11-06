import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';
import { User } from 'src/security/auth/decorators/user.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('purchase-orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Permissions('add_purchase_order')
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @User('id') userId: number,
  ) {
    return await this.ordersService.create(createOrderDto, userId);
  }

  @Post(':id')
  @Permissions('add_purchase_order')
  async createOrderItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ) {
    return await this.ordersService.createOrderItem(id, createOrderItemDto);
  }

  @Get()
  @Permissions('view_purchase_order')
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search: string | undefined,
  ) {
    return await this.ordersService.findAll(Math.max(page, 1), limit, search);
  }

  @Get('template')
  @Permissions('add_purchase_order')
  async template() {
    return await this.ordersService.template();
  }

  @Get(':id')
  @Permissions('view_purchase_order')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_purchase_order')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @User('id') userId: number,
  ) {
    if (id != updateOrderDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.ordersService.updateOrder(+id, updateOrderDto, userId);
  }

  @Patch(':id/items/:item_id')
  @Permissions('change_purchase_order')
  async updateOrderItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('item_id', ParseIntPipe) item_id: number,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
    @User('id') userId: number,
  ) {
    return await this.ordersService.updateOrderItem(
      +id,
      +item_id,
      updateOrderItemDto,
      userId,
    );
  }

  @Patch(':id/check')
  @Permissions('check_purchase_order')
  async checkOrder(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return await this.ordersService.checkOrApprove(+id, +userId, false);
  }

  @Patch(':id/approve')
  @Permissions('approve_purchase_order')
  async approveOrder(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return await this.ordersService.checkOrApprove(+id, +userId, true);
  }

  @Delete(':id')
  @Permissions('delete_purchase_order')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return await this.ordersService.remove(+id, userId);
  }

  @Delete(':id/items/:item_id')
  @Permissions('delete_purchase_order')
  async removeOrderItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('item_id', ParseIntPipe) item_id: number,
    @User('id') userId: number,
  ) {
    return await this.ordersService.removeOrderItem(+id, +item_id, userId);
  }
}
