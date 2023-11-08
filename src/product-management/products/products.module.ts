import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { ProductsService } from './products.service';

/** Controllers */
import { ProductsController } from './products.controller';

/** Entities */
import { Product } from './entities/product.entity';

/** Custom Validators */
import { UniqueNameValidator } from './validators/unique-name.validator';
import { ValidCategoryValidator } from './validators/valid-category.validator';
import { ValidProductValidator } from './validators/valid-product.validator';

/** Modules */
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CategoriesModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    UniqueNameValidator,
    ValidCategoryValidator,
    ValidProductValidator,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
