import { Controller, Get, UseGuards } from '@nestjs/common';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';

/** Services */
import { ReportsService } from './reports.service';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('info')
  async create() {
    return await this.reportsService.getCountReports();
  }
}
