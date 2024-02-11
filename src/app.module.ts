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

/** Data Sources */
import { dataSourceOptions } from './config/data-source';

/** Services */
import { StartupService } from './config/startup.service';
import { SeedService } from './config/seed.service';

/** Modules */
import { SecurityModule } from './security/security.module';
import { WebSocketsModule } from './web-sockets/web-sockets.module';
import { ConfigurationsModule } from './configurations/configurations.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ProductManagementModule } from './product-management/product-management.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SalesModule } from './sales/sales.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    SecurityModule,
    WebSocketsModule,
    ConfigurationsModule,
    PurchasesModule,
    ProductManagementModule,
    NotificationsModule,
    ReportsModule,
    SalesModule,
    ReservationsModule,
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
