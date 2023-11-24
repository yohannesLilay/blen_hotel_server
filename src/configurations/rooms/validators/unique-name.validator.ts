import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Services */
import { RoomsService } from '../rooms.service';

@Injectable()
@ValidatorConstraint({ name: 'uniqueName', async: true })
export class UniqueNameValidator implements ValidatorConstraintInterface {
  constructor(private readonly roomsService: RoomsService) {}

  async validate(name: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as any).id;

    const room = await this.roomsService.findByName(name);
    if (!room) return true;

    return room.id === id;
  }

  defaultMessage() {
    return 'Room Name already exists.';
  }
}
