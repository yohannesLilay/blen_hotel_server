import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StoreRequisitionsService } from './store-requisitions.service';
import { CreateStoreRequisitionDto } from './dto/create-store-requisition.dto';
import { UpdateStoreRequisitionDto } from './dto/update-store-requisition.dto';

@Controller('store-requisitions')
export class StoreRequisitionsController {
  constructor(private readonly storeRequisitionsService: StoreRequisitionsService) {}

  @Post()
  create(@Body() createStoreRequisitionDto: CreateStoreRequisitionDto) {
    return this.storeRequisitionsService.create(createStoreRequisitionDto);
  }

  @Get()
  findAll() {
    return this.storeRequisitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeRequisitionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreRequisitionDto: UpdateStoreRequisitionDto) {
    return this.storeRequisitionsService.update(+id, updateStoreRequisitionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeRequisitionsService.remove(+id);
  }
}
