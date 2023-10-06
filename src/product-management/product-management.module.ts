import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';

@Module({
  exports: [CategoriesModule, ProductsModule],
  providers: [],
  imports: [CategoriesModule, ProductsModule],
})
export class ProductManagementModule {}
