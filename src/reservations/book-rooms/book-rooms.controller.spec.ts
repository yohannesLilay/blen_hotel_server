import { Test, TestingModule } from '@nestjs/testing';
import { BookRoomsController } from './book-rooms.controller';
import { BookRoomsService } from './book-rooms.service';

describe('BookRoomsController', () => {
  let controller: BookRoomsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookRoomsController],
      providers: [BookRoomsService],
    }).compile();

    controller = module.get<BookRoomsController>(BookRoomsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
