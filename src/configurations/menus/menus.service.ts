import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as XLSX from 'xlsx';

/** DTOs */
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

/** Entities */
import { Menu } from './entities/menu.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create(createMenuDto);
    return await this.menuRepository.save(menu);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    menus: Menu[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [menus, total] = await this.menuRepository.findAndCount({
      where: search ? [{ item: ILike(`%${search}%`) }] : {},
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { menus, total, currentPage, totalPages };
  }

  async findAllList(): Promise<Menu[]> {
    return await this.menuRepository.find();
  }

  async findOne(id: number): Promise<Menu> {
    return await this.menuRepository.findOne({ where: { id } });
  }

  async findByItem(item: string): Promise<Menu> {
    return await this.menuRepository.findOne({ where: { item } });
  }

  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    if (!menu) throw new NotFoundException('Menu not found.');

    Object.assign(menu, updateMenuDto);
    return await this.menuRepository.save(menu);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    if (!menu) throw new NotFoundException('Menu not found.');

    await this.menuRepository.remove(menu);
  }

  async importExcel(file: Express.Multer.File): Promise<Menu[]> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const expectedHeaders = ['item', 'item_local_name', 'price', 'description'];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
    });

    if (!jsonData.length) {
      throw new HttpException(
        'No data found in the worksheet',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (
      !expectedHeaders.every((header) => jsonData[0].hasOwnProperty(header))
    ) {
      throw new HttpException(
        'Expected headers are missing in the Excel file',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    for (const row of jsonData) {
      const item = row['item'].trim();
      const price = row['price'];

      this.validateField(item, 'Menu item cannot be empty or null.');

      if (await this.doesMenuItemExist(item)) {
        throw new HttpException(
          `Menu with item '${item}' already exists.`,
          HttpStatus.CONFLICT,
        );
      }

      if (price !== null && price !== undefined && price !== '') {
        const priceNumber = parseFloat(price);
        if (isNaN(priceNumber)) {
          throw new HttpException(
            'Menu item price must be a valid number.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

      // Modify the row to use the Menu model
      row['price'] = price ? price : 0;
      row['item'] = item;
      row['item_local_name'] = row['item_local_name']
        ? row['item_local_name']
        : null;
      row['description'] = row['description'] ? row['description'] : null;
    }

    return await this.menuRepository.save(jsonData);
  }

  async getMenuCount(): Promise<number> {
    return await this.menuRepository.count();
  }

  async doesMenuItemExist(item): Promise<boolean> {
    const menu = await this.menuRepository.findOne({
      where: { item },
    });

    return !!menu;
  }

  validateField(value, message) {
    if (!value) {
      throw new HttpException(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
