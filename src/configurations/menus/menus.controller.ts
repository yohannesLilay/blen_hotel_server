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
  BadRequestException,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @Permissions('add_menu')
  async create(@Body() createMenuDto: CreateMenuDto) {
    return await this.menusService.create(createMenuDto);
  }

  @Get()
  @Permissions('view_menu')
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search: string | undefined,
  ) {
    return await this.menusService.findAll(Math.max(page, 1), limit, search);
  }

  @Get(':id')
  @Permissions('view_menu')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.menusService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('change_menu')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    if (id != updateMenuDto.id)
      throw new BadRequestException('ID mismatch between URL and request body');

    return await this.menusService.update(+id, updateMenuDto);
  }

  @Delete(':id')
  @Permissions('delete_menu')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.menusService.remove(+id);
  }

  @Post('import')
  @Permissions('import_menu')
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
    return await this.menusService.importExcel(file);
  }
}
