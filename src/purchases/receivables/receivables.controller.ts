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
} from '@nestjs/common';
import { Request } from 'express';

import { ReceivablesService } from './receivables.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { UpdateReceivableItemDto } from './dto/update-receivable-item.dto';
import { CreateReceivableItemDto } from './dto/create-receivable-item.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('purchase-receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Post()
  @Permissions('add_purchase_receivable')
  async create(
    @Body() createReceivableDto: CreateReceivableDto,
    @Req() req: Request,
  ) {
    return await this.receivablesService.create(
      createReceivableDto,
      req.user['sub'],
    );
  }

  @Post(':id')
  @Permissions('add_purchase_receivable')
  async createReceivableItem(
    @Param('id') id: number,
    @Body() createReceivableItemDto: CreateReceivableItemDto,
  ) {
    return await this.receivablesService.createReceivableItem(
      id,
      createReceivableItemDto,
    );
  }

  @Get()
  @Permissions('view_purchase_receivable')
  async findAll() {
    return await this.receivablesService.findAll();
  }

  @Get('template')
  @Permissions('add_purchase_receivable')
  async template() {
    return await this.receivablesService.template();
  }

  @Get(':id')
  @Permissions('view_purchase_receivable')
  async findOne(@Param('id') id: number) {
    return await this.receivablesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_purchase_receivable')
  async update(
    @Param('id') id: number,
    @Body() updateReceivableDto: UpdateReceivableDto,
    @Req() req: Request,
  ) {
    if (id != updateReceivableDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.receivablesService.updateReceivable(
      +id,
      updateReceivableDto,
      req.user['sub'],
    );
  }

  @Patch(':id/items/:item_id')
  @Permissions('change_purchase_receivable')
  async updateReceivableItem(
    @Param('id') id: number,
    @Param('item_id') item_id: number,
    @Body() updateReceivableItemDto: UpdateReceivableItemDto,
    @Req() req: Request,
  ) {
    return await this.receivablesService.updateReceivableItem(
      +id,
      +item_id,
      updateReceivableItemDto,
      req.user['sub'],
    );
  }

  @Patch(':id/change-status')
  @Permissions('change_purchase_receivable')
  async updateReceivableStatus(@Param('id') id: number, @Req() req: Request) {
    return await this.receivablesService.updateReceivableStatus(
      +id,
      req.user['sub'],
    );
  }

  @Delete(':id')
  @Permissions('delete_purchase_receivable')
  async remove(@Param('id') id: number, @Req() req: Request) {
    return await this.receivablesService.remove(+id, req.user['sub']);
  }

  @Delete(':id/items/:item_id')
  @Permissions('delete_purchase_receivable')
  async removeReceivableItem(
    @Param('id') id: number,
    @Param('item_id') item_id: number,
    @Req() req: Request,
  ) {
    return await this.receivablesService.removeReceivableItem(
      +id,
      +item_id,
      req.user['sub'],
    );
  }
}
