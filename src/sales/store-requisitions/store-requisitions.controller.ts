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
import { StoreRequisitionsService } from './store-requisitions.service';
import { CreateStoreRequisitionDto } from './dto/create-store-requisition.dto';
import { UpdateStoreRequisitionDto } from './dto/update-store-requisition.dto';
import { CreateStoreRequisitionItemDto } from './dto/create-store-requisition-item.dto';
import { UpdateStoreRequisitionItemDto } from './dto/update-store-requisition-item.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';
import { User } from 'src/security/auth/decorators/user.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('store-requisitions')
export class StoreRequisitionsController {
  constructor(
    private readonly storeRequisitionsService: StoreRequisitionsService,
  ) {}

  @Post()
  @Permissions('add_store_requisition')
  async create(
    @Body() createStoreRequisitionDto: CreateStoreRequisitionDto,
    @User('id') userId: number,
  ) {
    return await this.storeRequisitionsService.create(
      createStoreRequisitionDto,
      userId,
    );
  }

  @Post(':id')
  @Permissions('add_store_requisition')
  async createStoreRequisitionItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() createStoreRequisitionItemDto: CreateStoreRequisitionItemDto,
  ) {
    return await this.storeRequisitionsService.createStoreRequisitionItem(
      id,
      createStoreRequisitionItemDto,
    );
  }

  @Get()
  @Permissions('view_store_requisition')
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search: string | undefined,
  ) {
    return await this.storeRequisitionsService.findAll(
      Math.max(page, 1),
      limit,
      search,
    );
  }

  @Get('template')
  @Permissions('view_store_requisition')
  async template() {
    return await this.storeRequisitionsService.template();
  }

  @Get(':id')
  @Permissions('view_store_requisition')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.storeRequisitionsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_store_requisition')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreRequisitionDto: UpdateStoreRequisitionDto,
    @User('id') userId: number,
  ) {
    if (id != updateStoreRequisitionDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.storeRequisitionsService.updateStoreRequisition(
      +id,
      updateStoreRequisitionDto,
      userId,
    );
  }

  @Patch(':id/items/:item_id')
  @Permissions('change_store_requisition')
  async updateStoreRequisitionItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('item_id', ParseIntPipe) item_id: number,
    @Body() updateStoreRequisitionItemDto: UpdateStoreRequisitionItemDto,
    @User('id') userId: number,
  ) {
    return await this.storeRequisitionsService.updateStoreRequisitionItem(
      +id,
      +item_id,
      updateStoreRequisitionItemDto,
      userId,
    );
  }

  @Patch(':id/approve')
  @Permissions('approve_purchase_receivable')
  async approveReceivable(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return await this.storeRequisitionsService.approve(+id, +userId);
  }

  @Delete(':id')
  @Permissions('delete_store_requisition')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return await this.storeRequisitionsService.remove(+id, userId);
  }

  @Delete(':id/items/:item_id')
  @Permissions('delete_store_requisition')
  async removeStoreRequisitionItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('item_id', ParseIntPipe) item_id: number,
    @User('id') userId: number,
  ) {
    return await this.storeRequisitionsService.removeStoreRequisitionItem(
      +id,
      +item_id,
      userId,
    );
  }
}
