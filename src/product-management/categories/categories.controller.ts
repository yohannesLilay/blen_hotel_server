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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Permissions('add_category')
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Permissions('view_category')
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  @Permissions('view_category')
  async findOne(@Param('id') id: number) {
    return await this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_category')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    if (id != updateCategoryDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Permissions('delete_category')
  async remove(@Param('id') id: number) {
    return await this.categoriesService.remove(+id);
  }
}
