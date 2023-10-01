import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { InventoriesService } from './inventories.service';

/** Controllers */
import { InventoriesController } from './inventories.controller';

/** Entities */
import { Inventory } from './entities/inventory.entity';

/** Custom Validators */
import { UniqueNameValidator } from './validators/unique-name.validator';
import { ValidCategoryValidator } from './validators/valid-category.validator';

/** Modules */
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory]), CategoriesModule],
  controllers: [InventoriesController],
  providers: [InventoriesService, UniqueNameValidator, ValidCategoryValidator],
  exports: [InventoriesService],
})
export class InventoriesModule {}
