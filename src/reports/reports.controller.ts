import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';

/** Services */
import { ReportsService } from './reports.service';

/** DTOs */
import { RoomRevenueReportDto } from './dto/room-revenue-report.dto';
import { SalesByStaffReportDto } from './dto/sales-by-staff-report.dto';
import { ProductSalesReportDto } from './dto/product-sales-report.dto';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('info')
  async countReport() {
    return await this.reportsService.getCountReports();
  }

  @Get('template')
  async template() {
    return await this.reportsService.template();
  }

  @Post('room-revenues')
  @Permissions('view_room_revenue_report')
  async roomRevenue(@Body() roomRevenueReportDto: RoomRevenueReportDto) {
    return await this.reportsService.roomRevenue(roomRevenueReportDto);
  }

  @Post('sales-by-staff')
  @Permissions('view_sales_by_staff_report')
  async salesByStaff(@Body() salesByStaffReportDto: SalesByStaffReportDto) {
    return await this.reportsService.salesByStaff(salesByStaffReportDto);
  }

  @Post('product-sales')
  @Permissions('view_product_sales_report')
  async productSales(@Body() productSalesReportDto: ProductSalesReportDto) {
    return await this.reportsService.productSales(productSalesReportDto);
  }

  @Get('top-used-menus')
  async topUsedMenusReport() {
    return await this.reportsService.topUsedMenusReport();
  }

  @Get('top-income-menus')
  async topIncomeMenusReport() {
    return await this.reportsService.topIncomeMenusReport();
  }
}
