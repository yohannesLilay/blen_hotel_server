import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { RoomType } from '../constants/room_type.enum';
import { UniqueNameValidator } from '../validators/unique-name.validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  @Validate(UniqueNameValidator)
  name: string;

  @IsNotEmpty()
  @IsInt()
  price: number;

  @IsNotEmpty()
  @IsEnum(RoomType)
  room_type: RoomType;

  @IsOptional()
  @IsString()
  notes: string;
}
