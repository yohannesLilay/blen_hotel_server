import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, QueryRunner, Raw, Repository } from 'typeorm';

/** DTOs */
import { CreateCashReceiptDto } from './dto/create-cash-receipt.dto';

/** Entities */
import { CashReceipt } from './entities/cash-receipt.entity';
import { CashReceiptItem } from './entities/cash-receipt-item.entity';

/** Services */
import { MenusService } from 'src/configurations/menus/menus.service';
import { UsersService } from 'src/security/users/users.service';
import { StaffsService } from 'src/configurations/staffs/staffs.service';
import { RolesService } from 'src/security/roles/roles.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CaptainOrdersService } from '../captain-orders/captain-orders.service';

/** Constants */
import { CashReceiptStatus } from './constants/cash-receipt-status.enum';
import { NotificationType } from 'src/notifications/constants/notification-type.enum';
import { StaffType } from 'src/configurations/staffs/constants/staff-type.enum';

/** Gateways */
import { WebSocketsGateway } from 'src/web-sockets/web-sockets.gateway';

@Injectable()
export class CashReceiptsService {
  constructor(
    @InjectRepository(CashReceipt)
    private readonly cashReceiptRepository: Repository<CashReceipt>,
    @InjectRepository(CashReceiptItem)
    private readonly cashReceiptItemRepository: Repository<CashReceiptItem>,
    private readonly menusService: MenusService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly staffsService: StaffsService,
    private readonly captainOrdersService: CaptainOrdersService,
    private readonly notificationsService: NotificationsService,
    private readonly wsGateway: WebSocketsGateway,
    private dataSource: DataSource,
  ) {}

  async create(
    createCashReceiptDto: CreateCashReceiptDto,
    userId: number,
  ): Promise<CashReceipt> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedCashReceipt = await this.createCashReceipt(
        createCashReceiptDto,
        userId,
        queryRunner,
      );
      // await this.notifyCashReceiptCreation(savedCashReceipt);

      await queryRunner.commitTransaction();
      return savedCashReceipt;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async createCashReceipt(
    createCashReceiptDto: CreateCashReceiptDto,
    userId: number,
    queryRunner: QueryRunner,
  ): Promise<CashReceipt> {
    const cashReceiptNumber = await this.generateUniqueCashReceiptNumber();
    const cashReceipt = this.cashReceiptRepository.create({
      cash_receipt_number: cashReceiptNumber,
      cash_receipt_date: createCashReceiptDto.cash_receipt_date,
    });

    cashReceipt.captain_orders = await this.captainOrdersService.findByIds(
      createCashReceiptDto.captain_order_ids,
    );
    cashReceipt.casher = await this.usersService.findOne(userId);
    cashReceipt.waiter = await this.staffsService.findOne(
      createCashReceiptDto.waiter,
    );

    const savedCashReceipt = await queryRunner.manager.save(
      CashReceipt,
      cashReceipt,
    );

    for (const item of createCashReceiptDto.items) {
      const menu = await this.menusService.findOne(item.menu_id);
      const cashReceiptItem = this.cashReceiptItemRepository.create({
        cash_receipt: savedCashReceipt,
        quantity: item.quantity,
        unit_price: menu.price,
        total_price: item.quantity * menu.price,
      });
      cashReceiptItem.menu = menu;
      await queryRunner.manager.save(CashReceiptItem, cashReceiptItem);
    }

    return savedCashReceipt;
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    cashReceipts: CashReceipt[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    let searchParams: Record<string, any> = {};
    if (search) {
      searchParams = this.parseObjectString(search.toString());
    }

    const [cashReceipts, total] = await this.cashReceiptRepository.findAndCount(
      {
        relations: [
          'items',
          'items.menu',
          'casher',
          'waiter',
          'captain_orders',
        ],
        where: search
          ? {
              ...(searchParams?.cash_receipt_number !== null &&
                searchParams?.cash_receipt_number !== undefined && {
                  cash_receipt_number: ILike(
                    `%${searchParams?.cash_receipt_number}%`,
                  ),
                }),
              ...(searchParams?.waiter !== null &&
                searchParams?.waiter !== undefined && {
                  waiter: { id: searchParams?.waiter },
                }),
              ...(searchParams?.casher !== null &&
                searchParams?.casher !== undefined && {
                  created_by: { id: searchParams?.casher },
                }),
              ...(searchParams?.cash_receipt_date !== null &&
                searchParams?.cash_receipt_date !== undefined && {
                  cash_receipt_date: Raw(
                    (alias) =>
                      `DATE(${alias}) = '${
                        new Date(searchParams?.cash_receipt_date)
                          .toISOString()
                          .split('T')[0]
                      }'`,
                  ),
                }),
            }
          : {},
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      },
    );

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { cashReceipts, total, currentPage, totalPages };
  }

  async template(filter?: string) {
    let filterParams: Record<string, any> = {};
    if (filter) filterParams = this.parseObjectString(filter.toString());

    const menus = await this.menusService.findAllList();
    const waiterStaffs = await this.staffsService.findByStaffType(
      StaffType.WAITER,
    );
    const captainOrders = filterParams.waiter
      ? await this.captainOrdersService.findPrinted(filterParams.waiter)
      : [];
    const casherRole = await this.rolesService.findByName('CASHER');
    const cashers = await this.usersService.findByRoles([casherRole.id]);
    return {
      menuOptions: menus,
      waiterStaffOptions: waiterStaffs,
      casherEmployeeOptions: cashers,
      captainOrderOptions: captainOrders,
    };
  }

  async findOne(id: number): Promise<CashReceipt> {
    return await this.cashReceiptRepository.findOne({
      where: { id },
      relations: ['items', 'items.menu', 'casher', 'waiter', 'captain_orders'],
    });
  }

  async findByCashReceiptNumber(
    cashReceiptNumber: string,
  ): Promise<CashReceipt> {
    return await this.cashReceiptRepository.findOne({
      where: { cash_receipt_number: cashReceiptNumber },
    });
  }

  async findOneItem(id: number): Promise<CashReceiptItem> {
    return await this.cashReceiptItemRepository.findOne({
      where: { id },
    });
  }

  async print(id: number) {
    const cashReceipt = await this.findOne(id);
    if (!cashReceipt) throw new NotFoundException('Cash Receipt not found');

    cashReceipt.status = CashReceiptStatus.PRINTED;

    // Update the Captain Order
    for (const captainOrder of cashReceipt.captain_orders) {
      await this.captainOrdersService.markAsPaid(captainOrder.id);
    }

    return await this.cashReceiptRepository.save(cashReceipt);
  }

  async remove(id: number, userId): Promise<void> {
    const cashReceipt = await this.findOne(id);
    if (!cashReceipt) throw new NotFoundException('Cash Receipt not found.');

    this.checkCashReceiptForDelete(cashReceipt, userId);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // this.notifyCashReceiptRemoval(cashReceipt);
      await this.cashReceiptItemRepository.remove(cashReceipt.items);
      await this.cashReceiptRepository.remove(cashReceipt);
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private checkCashReceiptForDelete(cashReceipt: CashReceipt, userId: number) {
    if (cashReceipt.status != CashReceiptStatus.PENDING) {
      throw new BadRequestException(
        'This cash receipts item can not be deleted.',
      );
    }

    if (cashReceipt.casher?.id != userId) {
      throw new BadRequestException('Not allowed to delete this cash receipt.');
    }
  }

  private async notifyCashReceiptCreation(cashReceipt: CashReceipt) {
    const notificationMessage = `Cash Receipt (${cashReceipt.cash_receipt_number}) has been created & is ready for review.`;
    await Promise.all([this.notifyAdminUser(notificationMessage)]);
  }

  private async notifyCashReceiptRemoval(cashReceipt: CashReceipt) {
    const notificationMessage = `Cash Receipt (${cashReceipt.cash_receipt_number}) has been deleted.`;
    await this.notifyAdminUser(notificationMessage);
  }

  private async notifyAdminUser(notificationMessage): Promise<void> {
    const adminUsers = await this.usersService.findByRoles([1]);
    for (const user of adminUsers) {
      const notification = {
        message: notificationMessage,
        recipient: user.id,
        notification_type: NotificationType.INFO,
      };

      await this.notificationsService.create(notification);
      this.wsGateway.server
        .to(String(user.id))
        .emit('notification', notification);
    }
  }

  private parseObjectString(searchString: string): Record<string, any> {
    const searchParams: Record<string, any> = {};
    searchString.split('&').forEach((param) => {
      const [key, rawValue] = param.split('=');
      let value: string | number | Date | null = rawValue;

      if (rawValue === 'null') {
        value = null;
      } else {
        switch (key) {
          case 'cash_receipt_date':
            const dateValue = new Date(rawValue);
            if (!isNaN(dateValue.getTime())) {
              value = dateValue;
            }
            break;
          case 'waiter':
          case 'casher':
            const numericValue = parseInt(rawValue);
            if (!isNaN(numericValue)) {
              value = numericValue;
            }
            break;
        }
      }

      searchParams[key] = value;
    });

    return searchParams;
  }

  private async generateUniqueCashReceiptNumber(): Promise<string> {
    const latestCashReceipt = await this.cashReceiptRepository.findOne({
      order: { created_at: 'DESC' },
    });

    const startingNumber = latestCashReceipt
      ? parseInt(latestCashReceipt.cash_receipt_number.slice(3)) + 1
      : 1;

    const sequentialNumber = startingNumber.toString().padStart(5, '0');
    const cashReceiptNumber = `CI-${sequentialNumber}`;

    return cashReceiptNumber;
  }
}
