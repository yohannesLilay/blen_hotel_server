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
      description: createProductDto.description,
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
    return { categoryOptions: categories };
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
    product.description = updateProductDto.description;
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
