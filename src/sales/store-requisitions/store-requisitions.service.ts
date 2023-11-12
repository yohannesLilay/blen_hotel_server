import { Injectable } from '@nestjs/common';
import { CreateStoreRequisitionDto } from './dto/create-store-requisition.dto';
import { UpdateStoreRequisitionDto } from './dto/update-store-requisition.dto';

@Injectable()
export class StoreRequisitionsService {
  create(createStoreRequisitionDto: CreateStoreRequisitionDto) {
    return 'This action adds a new storeRequisition';
  }

  findAll() {
    return `This action returns all storeRequisitions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} storeRequisition`;
  }

  update(id: number, updateStoreRequisitionDto: UpdateStoreRequisitionDto) {
    return `This action updates a #${id} storeRequisition`;
  }

  remove(id: number) {
    return `This action removes a #${id} storeRequisition`;
  }
}
