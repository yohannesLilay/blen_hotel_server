import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/** Services */
import { RoomsService } from 'src/configurations/rooms/rooms.service';

@ValidatorConstraint({ name: 'validRoom', async: true })
@Injectable()
export class ValidRoomValidator implements ValidatorConstraintInterface {
  constructor(private readonly roomsService: RoomsService) {}

  async validate(roomId: number) {
    if (!roomId) return false;

    const room = await this.roomsService.findOne(roomId);

    return !!room;
  }

  defaultMessage() {
    return `The Room ID is invalid or do not exist.`;
  }
}
