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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/** Services */
import { CategoriesService } from '../categories/categories.service';

/** Entities */
import { Product } from './entities/product.entity';

/** Constants */
import { UnitOfMeasure } from './constants/unit-of-measure.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      name: createProductDto.name,
      unit_of_measure: createProductDto.unit_of_measure,
      safety_stock_level: createProductDto.safety_stock_level,
      notes: createProductDto.notes,
      stock_quantity: 0,
    });
    product.category = await this.categoriesService.findOne(
      createProductDto.categoryId,
    );

    return await this.productRepository.save(product);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    products: Product[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [products, total] = await this.productRepository.findAndCount({
      relations: ['category'],
      where: search
        ? [
            { name: ILike(`%${search}%`) },
            { category: { name: ILike(`%${search}%`) } },
          ]
        : {},
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { products, total, currentPage, totalPages };
  }

  async findAllList(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async template() {
    const categories = await this.categoriesService.findAllList();
    return { categoryOptions: categories, uomOptions: UnitOfMeasure };
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findByName(name: string): Promise<Product> {
    return await this.productRepository.findOne({ where: { name } });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Product not found.');

    product.name = updateProductDto.name;
    product.unit_of_measure = updateProductDto.unit_of_measure;
    product.safety_stock_level = updateProductDto.safety_stock_level;
    product.notes = updateProductDto.notes;
    product.category = await this.categoriesService.findOne(
      updateProductDto.categoryId,
    );

    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Product not found.');

    await this.productRepository.remove(product);
  }

  async importExcel(file: Express.Multer.File): Promise<Product[]> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const expectedHeaders = [
      'name',
      'unit_of_measure',
      'category',
      'stock_quantity',
      'safety_stock_level',
      'note',
    ];

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
      const name = row['name'].trim();
      const unitOfMeasure = row['unit_of_measure'].trim();
      const category = row['category'].trim();
      const stockQuantity = row['stock_quantity'];
      const safetyStockLevel = row['safety_stock_level'];

      this.validateField(name, 'Product name cannot be empty or null.');
      this.validateField(
        unitOfMeasure,
        'Product unit of measure cannot be empty or null.',
      );
      this.validateField(category, 'Product category cannot be empty or null.');

      if (!Object.values(UnitOfMeasure).includes(unitOfMeasure)) {
        throw new HttpException(
          'Invalid unit of measure value.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (await this.doesProductNameExist(name)) {
        throw new HttpException(
          `Product with name '${name}' already exists.`,
          HttpStatus.CONFLICT,
        );
      }

      if (!(await this.isCategoryNameValid(category))) {
        throw new HttpException(
          `Product Category with name '${category}' does not exists.`,
          HttpStatus.CONFLICT,
        );
      }

      if (
        stockQuantity !== null &&
        stockQuantity !== undefined &&
        stockQuantity !== ''
      ) {
        const stockQuantityNumber = parseInt(stockQuantity);
        if (isNaN(stockQuantityNumber)) {
          throw new HttpException(
            'Stock quantity must be a valid number.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

      if (
        safetyStockLevel !== null &&
        safetyStockLevel !== undefined &&
        safetyStockLevel !== ''
      ) {
        const safetyStockLevelNumber = parseInt(safetyStockLevel);
        if (isNaN(safetyStockLevelNumber)) {
          throw new HttpException(
            'Safety stock level must be a valid number.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

      // Modify the row to use the Category model
      row['category'] = await this.categoriesService.findByName(category);
      row['stock_quantity'] = stockQuantity ? stockQuantity : 0;
      row['safety_stock_level'] = safetyStockLevel ? safetyStockLevel : null;
      row['name'] = name;
      row['unit_of_measure'] = unitOfMeasure;
    }

    return await this.productRepository.save(jsonData);
  }

  async getProductCount(): Promise<number> {
    return await this.productRepository.count();
  }

  async doesProductNameExist(name): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { name },
    });

    return !!product;
  }

  async isCategoryNameValid(name): Promise<boolean> {
    const category = await this.categoriesService.findByName(name);

    return !!category;
  }

  validateField(value, message) {
    if (!value) {
      throw new HttpException(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
