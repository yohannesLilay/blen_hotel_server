import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CaptainOrdersService } from './captain-orders.service';
import { CreateCaptainOrderDto } from './dto/create-captain-order.dto';
import { UpdateCaptainOrderDto } from './dto/update-captain-order.dto';
import { CreateCaptainOrderItemDto } from './dto/create-captain-order-item.dto';
import { UpdateCaptainOrderItemDto } from './dto/update-captain-order-item.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';
import { User } from 'src/security/auth/decorators/user.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('captain-orders')
export class CaptainOrdersController {
  constructor(private readonly captainOrderService: CaptainOrdersService) {}

  @Post()
  @Permissions('add_captain_order')
  async create(
    @Body() createCaptainOrderDto: CreateCaptainOrderDto,
    @User('id') userId: number,
  ) {
    return await this.captainOrderService.create(createCaptainOrderDto, userId);
  }

  @Post(':id')
  @Permissions('add_captain_order')
  async createCaptainOrderItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCaptainOrderItemDto: CreateCaptainOrderItemDto,
  ) {
    return await this.captainOrderService.createCaptainOrderItem(
      id,
      createCaptainOrderItemDto,
    );
  }

  @Get()
  @Permissions('view_captain_order')
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search: string | undefined,
  ) {
    return await this.captainOrderService.findAll(
      Math.max(page, 1),
      limit,
      search,
    );
  }

  @Get('template')
  @Permissions('view_captain_order')
  async template() {
    return await this.captainOrderService.template();
  }

  @Get(':id')
  @Permissions('view_captain_order')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.captainOrderService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_captain_order')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCaptainOrderDto: UpdateCaptainOrderDto,
    @User('id') userId: number,
  ) {
    if (id != updateCaptainOrderDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.captainOrderService.updateCaptainOrder(
      +id,
      updateCaptainOrderDto,
      userId,
    );
  }

  @Patch(':id/items/:item_id')
  @Permissions('change_captain_order')
  async updateCaptainOrderItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('item_id', ParseIntPipe) item_id: number,
    @Body() updateCaptainOrderItemDto: UpdateCaptainOrderItemDto,
    @User('id') userId: number,
  ) {
    return await this.captainOrderService.updateCaptainOrderItem(
      +id,
      +item_id,
      updateCaptainOrderItemDto,
      userId,
    );
  }

  @Patch(':id/print')
  @Permissions('print_captain_order')
  async printCaptainOrder(@Param('id', ParseIntPipe) id: number) {
    return await this.captainOrderService.print(+id);
  }

  @Delete(':id')
  @Permissions('delete_captain_order')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return await this.captainOrderService.remove(+id, userId);
  }

  @Delete(':id/items/:item_id')
  @Permissions('delete_captain_order')
  async removeCaptainOrderItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('item_id', ParseIntPipe) item_id: number,
    @User('id') userId: number,
  ) {
    return await this.captainOrderService.removeCaptainOrderItem(
      +id,
      +item_id,
      userId,
    );
  }
}
