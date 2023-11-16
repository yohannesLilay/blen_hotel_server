import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { MenusService } from './menus.service';

/** Controllers */
import { MenusController } from './menus.controller';

/** Entities */
import { Menu } from './entities/menu.entity';

/** Custom Validators */
import { UniqueItemValidator } from './validators/unique-item.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  controllers: [MenusController],
  providers: [MenusService, UniqueItemValidator],
  exports: [MenusService],
})
export class MenusModule {}
