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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions('add_product')
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  @Permissions('view_product')
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search: string | undefined,
  ) {
    return await this.productsService.findAll(Math.max(page, 1), limit, search);
  }

  @Get('template')
  @Permissions('add_product')
  async template() {
    return await this.productsService.template();
  }

  @Get(':id')
  @Permissions('view_product')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_product')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    if (id != updateProductDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @Permissions('delete_product')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.remove(+id);
  }
}
