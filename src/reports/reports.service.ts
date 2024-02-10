import { Injectable } from '@nestjs/common';

/** Services */
import { CategoriesService } from 'src/product-management/categories/categories.service';
import { ProductsService } from 'src/product-management/products/products.service';
import { OrdersService } from 'src/purchases/orders/orders.service';
import { ReceivablesService } from 'src/purchases/receivables/receivables.service';
import { BookRoomsService } from 'src/reservations/book-rooms/book-rooms.service';
import { StaffsService } from 'src/configurations/staffs/staffs.service';
import { CashReceiptsService } from 'src/sales/cash-receipts/cash-receipts.service';
import { MenusService } from 'src/configurations/menus/menus.service';

/** DTOs */
import { RoomRevenueReportDto } from './dto/room-revenue-report.dto';
import { SalesByStaffReportDto } from './dto/sales-by-staff-report.dto';
import { StaffType } from 'src/configurations/staffs/constants/staff-type.enum';
import { ProductSalesReportDto } from './dto/product-sales-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly receivablesService: ReceivablesService,
    private readonly bookRoomsService: BookRoomsService,
    private readonly staffsService: StaffsService,
    private readonly cashReceiptsService: CashReceiptsService,
    private readonly menusService: MenusService,
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

  async template() {
    const waiterStaffs = await this.staffsService.findByStaffType(
      StaffType.WAITER,
    );
    const menus = await this.menusService.findAllList();

    return {
      waiterStaffOptions: waiterStaffs,
      menuOptions: menus,
    };
  }

  async roomRevenue(roomRevenueReportDto: RoomRevenueReportDto) {
    return await this.bookRoomsService.roomRevenueReport(
      roomRevenueReportDto.start_date,
      roomRevenueReportDto.end_date,
    );
  }

  async salesByStaff(salesByStaffReportDto: SalesByStaffReportDto) {
    return await this.cashReceiptsService.salesByStaffReport(
      salesByStaffReportDto.start_date,
      salesByStaffReportDto.end_date,
      salesByStaffReportDto.staff_id,
    );
  }

  async productSales(productSalesReportDto: ProductSalesReportDto) {
    return await this.cashReceiptsService.productSalesReport(
      productSalesReportDto.start_date,
      productSalesReportDto.end_date,
      productSalesReportDto.product_id,
    );
  }

  async topUsedMenusReport() {
    return await this.cashReceiptsService.topUsedMenusReport();
  }

  async topIncomeMenusReport() {
    return await this.cashReceiptsService.topIncomeMenusReport();
  }
}
