import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { CategoriesService } from './categories.service';

/** Controllers */
import { CategoriesController } from './categories.controller';

/** Entities */
import { Category } from './entities/category.entity';

/** Custom Validators */
import { UniqueNameValidator } from './validators/unique-name.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService, UniqueNameValidator],
  exports: [CategoriesService],
})
export class CategoriesModule {}
