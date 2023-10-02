import { Module } from '@nestjs/common';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CategoriesModule } from './categories/categories.module';
import { InventoriesModule } from './inventories/inventories.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [SuppliersModule, CategoriesModule, InventoriesModule, CompaniesModule],
  providers: [],
  exports: [SuppliersModule, CategoriesModule, InventoriesModule],
})
export class ConfigurationsModule {}
