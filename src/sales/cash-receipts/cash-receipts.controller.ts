import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CashReceiptsService } from './cash-receipts.service';
import { CreateCashReceiptDto } from './dto/create-cash-receipt.dto';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';
import { User } from 'src/security/auth/decorators/user.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('cash-receipts')
export class CashReceiptsController {
  constructor(private readonly cashReceiptsService: CashReceiptsService) {}

  @Post()
  @Permissions('add_cash_receipt')
  async create(
    @Body() createCashReceiptDto: CreateCashReceiptDto,
    @User('id') userId: number,
  ) {
    return await this.cashReceiptsService.create(createCashReceiptDto, userId);
  }

  @Get()
  @Permissions('view_cash_receipt')
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search: string | undefined,
  ) {
    return await this.cashReceiptsService.findAll(
      Math.max(page, 1),
      limit,
      search,
    );
  }

  @Get('template')
  @Permissions('view_cash_receipt')
  async template(@Query('filter') filter: string | undefined) {
    return await this.cashReceiptsService.template(filter);
  }

  @Get(':id')
  @Permissions('view_cash_receipt')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.cashReceiptsService.findOne(+id);
  }

  @Patch(':id/print')
  @Permissions('print_cash_receipt')
  async printCashReceipt(@Param('id', ParseIntPipe) id: number) {
    return await this.cashReceiptsService.print(+id);
  }

  @Delete(':id')
  @Permissions('delete_cash_receipt')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return await this.cashReceiptsService.remove(+id, userId);
  }
}
