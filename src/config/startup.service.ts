import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SeedService } from './seed.service';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  constructor(private readonly seedService: SeedService) {}

  async onApplicationBootstrap() {
    console.log('Seeding started....');
    await this.seedService.seed();
    console.log('Seeding completed...');
  }
}
