import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CaptainOrderService } from './captain-order.service';
import { CreateCaptainOrderDto } from './dto/create-captain-order.dto';
import { UpdateCaptainOrderDto } from './dto/update-captain-order.dto';

@Controller('captain-order')
export class CaptainOrderController {
  constructor(private readonly captainOrderService: CaptainOrderService) {}

  @Post()
  create(@Body() createCaptainOrderDto: CreateCaptainOrderDto) {
    return this.captainOrderService.create(createCaptainOrderDto);
  }

  @Get()
  findAll() {
    return this.captainOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.captainOrderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaptainOrderDto: UpdateCaptainOrderDto) {
    return this.captainOrderService.update(+id, updateCaptainOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.captainOrderService.remove(+id);
  }
}
