import { Injectable } from '@nestjs/common';
import { CreateCaptainOrderDto } from './dto/create-captain-order.dto';
import { UpdateCaptainOrderDto } from './dto/update-captain-order.dto';

@Injectable()
export class CaptainOrderService {
  create(createCaptainOrderDto: CreateCaptainOrderDto) {
    return 'This action adds a new captainOrder';
  }

  findAll() {
    return `This action returns all captainOrder`;
  }

  findOne(id: number) {
    return `This action returns a #${id} captainOrder`;
  }

  update(id: number, updateCaptainOrderDto: UpdateCaptainOrderDto) {
    return `This action updates a #${id} captainOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} captainOrder`;
  }
}
