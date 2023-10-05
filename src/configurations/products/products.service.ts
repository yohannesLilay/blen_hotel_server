import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/** DTOs */
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/** Services */
import { CategoriesService } from '../categories/categories.service';

/** Entities */
import { Product } from './entities/product.entity';
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
    });

    product.category = await this.categoriesService.findOne(
      createProductDto.categoryId,
    );

    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({ relations: ['category'] });
  }

  async template() {
    const categories = await this.categoriesService.findAll();
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
}
