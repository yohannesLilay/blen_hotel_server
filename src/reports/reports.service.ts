import { Injectable } from '@nestjs/common';

/** Services */
import { CategoriesService } from 'src/product-management/categories/categories.service';
import { ProductsService } from 'src/product-management/products/products.service';
import { OrdersService } from 'src/purchases/orders/orders.service';
import { ReceivablesService } from 'src/purchases/receivables/receivables.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly receivablesService: ReceivablesService,
  ) {}

  async getCountReports() {
    const [
      categoryCount,
      productCount,
      activeOrderCount,
      activeReceivableCount,
    ] = await Promise.all([
      this.categoriesService.getCategoryCount(),
      this.productsService.getProductCount(),
      this.ordersService.getActiveOrderCount(),
      this.receivablesService.getActiveOrderCount(),
    ]);

    return {
      categoryCount,
      productCount,
      activeOrderCount,
      activeReceivableCount,
    };
  }
}
