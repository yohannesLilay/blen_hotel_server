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
} from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  @Permissions('add_inventory')
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    return await this.inventoriesService.create(createInventoryDto);
  }

  @Get()
  @Permissions('view_inventory')
  async findAll() {
    return await this.inventoriesService.findAll();
  }

  @Get('template')
  @Permissions('add_inventory')
  async template() {
    return await this.inventoriesService.template();
  }

  @Get(':id')
  @Permissions('view_inventory')
  async findOne(@Param('id') id: number) {
    return await this.inventoriesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_inventory')
  async update(
    @Param('id') id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    if (id != updateInventoryDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.inventoriesService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  @Permissions('delete_inventory')
  async remove(@Param('id') id: number) {
    return await this.inventoriesService.remove(+id);
  }
}
