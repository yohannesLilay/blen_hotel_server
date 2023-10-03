import { Module } from '@nestjs/common';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [SuppliersModule, CategoriesModule, ProductsModule, CompaniesModule],
  providers: [],
  exports: [SuppliersModule, CategoriesModule, ProductsModule],
})
export class ConfigurationsModule {}
