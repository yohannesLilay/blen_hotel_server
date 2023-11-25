import { PartialType } from '@nestjs/swagger';
import { CreateBookRoomDto } from './create-book-room.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateBookRoomDto extends PartialType(CreateBookRoomDto) {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
