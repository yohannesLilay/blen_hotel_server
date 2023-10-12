import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Middlewares */
import { TrimMiddleware } from './middlewares/trim.middleware';

/** Services */
import { StartupService } from './config/startup.service';
import { SeedService } from './config/seed.service';

/** Modules */
import { SecurityModule } from './security/security.module';
import { ConfigurationsModule } from './configurations/configurations.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ProductManagementModule } from './product-management/product-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(<string>process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    }),
    SecurityModule,
    ConfigurationsModule,
    PurchasesModule,
    ProductManagementModule,
  ],
  controllers: [],
  providers: [StartupService, SeedService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TrimMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT },
        { path: '*', method: RequestMethod.PATCH },
      );
  }
}
