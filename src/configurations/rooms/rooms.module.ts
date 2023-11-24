import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { RoomsService } from './rooms.service';

/** Controllers */
import { RoomsController } from './rooms.controller';

/** Entities */
import { Room } from './entities/room.entity';

/** Custom Validators */
import { UniqueNameValidator } from './validators/unique-name.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Room])],
  controllers: [RoomsController],
  providers: [RoomsService, UniqueNameValidator],
  exports: [RoomsService],
})
export class RoomsModule {}
