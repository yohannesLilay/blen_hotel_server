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
  UseInterceptors,
  UploadedFile,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search: string | undefined,
  ) {
    return await this.categoriesService.findAll(
      Math.max(page, 1),
      limit,
      search,
    );
  }

  @Get(':id')
  @Permissions('view_category')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_category')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    if (id != updateCategoryDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Permissions('delete_category')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.remove(+id);
  }

  @Post('import')
  @Permissions('import_category')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 4 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.categoriesService.importExcel(file);
  }
}
