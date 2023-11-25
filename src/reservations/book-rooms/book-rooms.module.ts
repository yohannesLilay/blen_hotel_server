import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { BookRoomsService } from './book-rooms.service';

/** Controllers */
import { BookRoomsController } from './book-rooms.controller';

/** Entities */
import { BookRoom } from './entities/book-room.entity';

/** Modules */
import { RoomsModule } from 'src/configurations/rooms/rooms.module';

/** Custom Validators */
import { ValidRoomValidator } from './validators/valid-room.validator';

@Module({
  imports: [TypeOrmModule.forFeature([BookRoom]), RoomsModule],
  controllers: [BookRoomsController],
  providers: [BookRoomsService, ValidRoomValidator],
  exports: [BookRoomsService],
})
export class BookRoomsModule {}
