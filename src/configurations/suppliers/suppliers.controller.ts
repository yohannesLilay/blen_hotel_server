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
  ParseIntPipe,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Permissions('add_supplier')
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @Permissions('view_supplier')
  async findAll() {
    return await this.suppliersService.findAll();
  }

  @Get(':id')
  @Permissions('view_supplier')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.suppliersService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_supplier')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    if (id != updateSupplierDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.suppliersService.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  @Permissions('delete_supplier')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.suppliersService.remove(+id);
  }
}
