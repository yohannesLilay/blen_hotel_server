import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { ValidRoomValidator } from '../validators/valid-room.validator';

export class CreateBookRoomDto {
  @IsOptional()
  @IsDateString()
  book_date?: Date;

  @IsNotEmpty()
  @IsInt()
  @Validate(ValidRoomValidator)
  room_id: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
