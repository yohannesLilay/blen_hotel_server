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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/** Entities */
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    categories: Category[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [categories, total] = await this.categoryRepository.findAndCount({
      where: search ? [{ name: ILike(`%${search}%`) }] : {},
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { categories, total, currentPage, totalPages };
  }

  async findAllList(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    return await this.categoryRepository.findOneBy({ id });
  }

  async findByName(name: string): Promise<Category> {
    return await this.categoryRepository.findOne({ where: { name } });
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);
    if (!category) throw new NotFoundException('Category not found.');

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    if (!category) throw new NotFoundException('Category not found.');

    await this.categoryRepository.remove(category);
  }

  async importExcel(file: Express.Multer.File): Promise<Category[]> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const expectedHeaders = ['name', 'description'];

    const jsonData: CreateCategoryDto[] = XLSX.utils.sheet_to_json(worksheet, {
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
      const name = row['name'].trim();

      if (!name) {
        throw new HttpException(
          'Category name cannot be empty or null.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (await this.doesCategoryNameExist(name)) {
        throw new HttpException(
          `Category with name '${name}' already exists.`,
          HttpStatus.CONFLICT,
        );
      }

      row['name'] = name;
    }

    return await this.categoryRepository.save(jsonData);
  }

  async doesCategoryNameExist(name): Promise<boolean> {
    const category = await this.categoryRepository.findOne({
      where: { name },
    });

    return !!category;
  }
}
