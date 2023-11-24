import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
