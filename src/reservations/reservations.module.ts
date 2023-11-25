import { Module } from '@nestjs/common';
import { BookRoomsModule } from './book-rooms/book-rooms.module';

@Module({
  imports: [BookRoomsModule],
  providers: [],
  exports: [BookRoomsModule],
})
export class ReservationsModule {}
