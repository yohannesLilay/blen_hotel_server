import { Test, TestingModule } from '@nestjs/testing';
import { BookRoomsService } from './book-rooms.service';

describe('BookRoomsService', () => {
  let service: BookRoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookRoomsService],
    }).compile();

    service = module.get<BookRoomsService>(BookRoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
