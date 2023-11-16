import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, QueryRunner, Repository } from 'typeorm';

/** DTOs */
import { CreateCaptainOrderDto } from './dto/create-captain-order.dto';
import { UpdateCaptainOrderDto } from './dto/update-captain-order.dto';
import { CreateCaptainOrderItemDto } from './dto/create-captain-order-item.dto';
import { UpdateCaptainOrderItemDto } from './dto/update-captain-order-item.dto';

/** Entities */
import { CaptainOrder } from './entities/captain-order.entity';
import { CaptainOrderItem } from './entities/captain-order-item.entity';

/** Services */
import { MenusService } from 'src/configurations/menus/menus.service';
import { UsersService } from 'src/security/users/users.service';
import { StaffsService } from 'src/configurations/staffs/staffs.service';
import { FacilityTypesService } from 'src/configurations/facility-types/facility-types.service';
import { NotificationsService } from 'src/notifications/notifications.service';

/** Constants */
import { CaptainOrderStatus } from './constants/captain-order-status.enum';
import { NotificationType } from 'src/notifications/constants/notification-type.enum';

/** Gateways */
import { WebSocketsGateway } from 'src/web-sockets/web-sockets.gateway';
import { StaffType } from 'src/configurations/staffs/constants/staff-type.enum';

@Injectable()
export class CaptainOrdersService {
  constructor(
    @InjectRepository(CaptainOrder)
    private readonly captainOrderRepository: Repository<CaptainOrder>,
    @InjectRepository(CaptainOrderItem)
    private readonly captainOrderItemRepository: Repository<CaptainOrderItem>,
    private readonly menusService: MenusService,
    private readonly usersService: UsersService,
    private readonly staffsService: StaffsService,
    private readonly facilityTypesService: FacilityTypesService,
    private readonly notificationsService: NotificationsService,
    private readonly wsGateway: WebSocketsGateway,
    private dataSource: DataSource,
  ) {}

  async create(
    createCaptainOrderDto: CreateCaptainOrderDto,
    userId: number,
  ): Promise<CaptainOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedCaptainOrder = await this.createCaptainOrder(
        createCaptainOrderDto,
        userId,
        queryRunner,
      );
      // await this.notifyCaptainOrderCreation(savedCaptainOrder);

      await queryRunner.commitTransaction();
      return savedCaptainOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async createCaptainOrder(
    createCaptainOrderDto: CreateCaptainOrderDto,
    userId: number,
    queryRunner: QueryRunner,
  ): Promise<CaptainOrder> {
    const captainOrder = this.captainOrderRepository.create({
      captain_order_number: createCaptainOrderDto.captain_order_number,
      captain_order_date: createCaptainOrderDto.captain_order_date,
      status: CaptainOrderStatus.CREATED,
    });

    captainOrder.created_by = await this.usersService.findOne(userId);
    captainOrder.waiter = await this.staffsService.findOne(
      createCaptainOrderDto.waiter,
    );
    captainOrder.facility_type = await this.facilityTypesService.findOne(
      createCaptainOrderDto.facility_type_id,
    );
    const savedCaptainOrder = await queryRunner.manager.save(
      CaptainOrder,
      captainOrder,
    );

    for (const item of createCaptainOrderDto.items) {
      const captainOrderItem = this.captainOrderItemRepository.create({
        captain_order: savedCaptainOrder,
        quantity: item.quantity,
      });
      captainOrderItem.menu = await this.menusService.findOne(item.menu_id);
      await queryRunner.manager.save(CaptainOrderItem, captainOrderItem);
    }

    return savedCaptainOrder;
  }

  async createCaptainOrderItem(
    id: number,
    createCaptainOrderItemDto: CreateCaptainOrderItemDto,
  ): Promise<CaptainOrderItem> {
    const captainOrder = await this.findOne(id);
    if (!captainOrder) throw new NotFoundException('Captain Order not found.');

    if (captainOrder.status !== CaptainOrderStatus.CREATED)
      throw new BadRequestException(
        'It is not allowed to add a new captain order item.',
      );

    const captainOrderItem = this.captainOrderItemRepository.create({
      captain_order: captainOrder,
      quantity: createCaptainOrderItemDto.quantity,
    });
    captainOrderItem.menu = await this.menusService.findOne(
      createCaptainOrderItemDto.menu_id,
    );

    // await this.notifyCaptainOrderModification(captainOrder);

    return await this.captainOrderItemRepository.save(captainOrderItem);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    captainOrders: CaptainOrder[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [captainOrders, total] =
      await this.captainOrderRepository.findAndCount({
        relations: [
          'items',
          'items.menu',
          'created_by',
          'waiter',
          'facility_type',
        ],
        where: search ? [{ captain_order_number: ILike(`%${search}%`) }] : {},
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { captainOrders, total, currentPage, totalPages };
  }

  async template() {
    const menus = await this.menusService.findAllList();
    const waiterStaffs = await this.staffsService.findByStaffType(
      StaffType.WAITER,
    );
    const facilityTypes = await this.facilityTypesService.findAll();
    return {
      menuOptions: menus,
      waiterStaffOptions: waiterStaffs,
      facilityTypeOptions: facilityTypes,
    };
  }

  async findOne(id: number): Promise<CaptainOrder> {
    return await this.captainOrderRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.menu',
        'created_by',
        'waiter',
        'facility_type',
      ],
    });
  }

  async findByCaptainOrderNumber(
    captainOrderNumber: string,
  ): Promise<CaptainOrder> {
    return await this.captainOrderRepository.findOne({
      where: { captain_order_number: captainOrderNumber },
    });
  }

  async findOneItem(id: number): Promise<CaptainOrderItem> {
    return await this.captainOrderItemRepository.findOne({
      where: { id },
    });
  }

  async updateCaptainOrder(
    id: number,
    updateCaptainOrderDto: UpdateCaptainOrderDto,
    userId: number,
  ): Promise<CaptainOrder> {
    const captainOrder = await this.findOne(id);
    if (!captainOrder) throw new NotFoundException('Captain Order not found.');

    this.checkCaptainOrderForUpdate(captainOrder, userId);

    captainOrder.captain_order_number =
      updateCaptainOrderDto.captain_order_number;
    captainOrder.captain_order_date = updateCaptainOrderDto.captain_order_date;
    captainOrder.waiter = await this.staffsService.findOne(
      updateCaptainOrderDto.waiter,
    );
    captainOrder.facility_type = await this.facilityTypesService.findOne(
      updateCaptainOrderDto.facility_type_id,
    );

    // await this.notifyCaptainOrderModification(captainOrder);

    return await this.captainOrderRepository.save(captainOrder);
  }

  async updateCaptainOrderItem(
    id: number,
    itemId: number,
    updateCaptainOrderItemDto: UpdateCaptainOrderItemDto,
    userId: number,
  ): Promise<CaptainOrderItem> {
    const captainOrder = await this.findOne(id);
    if (!captainOrder) throw new NotFoundException('Captain Order not found.');

    this.checkCaptainOrderForUpdate(captainOrder, userId);

    const captainOrderItem = await this.findOneItem(itemId);
    if (!captainOrderItem)
      throw new NotFoundException('Captain Order Item not found.');

    captainOrderItem.quantity = updateCaptainOrderItemDto.quantity;

    // await this.notifyCaptainOrderModification(captainOrder);

    return await this.captainOrderItemRepository.save(captainOrderItem);
  }

  async print(id: number) {
    const captainOrder = await this.findOne(id);
    if (!captainOrder) throw new NotFoundException('Captain Order not found');

    captainOrder.status = CaptainOrderStatus.PRINTED;

    return await this.captainOrderRepository.save(captainOrder);
  }

  async remove(id: number, userId): Promise<void> {
    const captainOrder = await this.findOne(id);
    if (!captainOrder) throw new NotFoundException('Captain Order not found.');

    this.checkCaptainOrderForDelete(captainOrder, userId);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // this.notifyCaptainOrderRemoval(captainOrder);
      await this.captainOrderItemRepository.remove(captainOrder.items);
      await this.captainOrderRepository.remove(captainOrder);
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async removeCaptainOrderItem(
    id: number,
    itemId: number,
    userId: number,
  ): Promise<void> {
    const captainOrder = await this.findOne(id);
    if (!captainOrder) throw new NotFoundException('Captain Order not found.');

    this.checkCaptainOrderForDelete(captainOrder, userId);

    const captainOrderItem = await this.findOneItem(itemId);
    if (!captainOrderItem)
      throw new NotFoundException('Captain Order Item not found.');

    // this.notifyCaptainOrderModification(captainOrder);

    await this.captainOrderItemRepository.remove(captainOrderItem);
  }

  private checkCaptainOrderForUpdate(
    captainOrder: CaptainOrder,
    userId: number,
  ) {
    if (captainOrder.status != CaptainOrderStatus.CREATED) {
      throw new BadRequestException(
        'Store requisition status does not allow updates.',
      );
    }

    if (captainOrder.created_by?.id != userId) {
      throw new BadRequestException(
        'Not allowed to update this captain order.',
      );
    }
  }

  private checkCaptainOrderForDelete(
    captainOrder: CaptainOrder,
    userId: number,
  ) {
    if (captainOrder.status != CaptainOrderStatus.CREATED) {
      throw new BadRequestException(
        'This captain orders item can not be deleted.',
      );
    }

    if (captainOrder.created_by?.id != userId) {
      throw new BadRequestException(
        'Not allowed to delete this captain order.',
      );
    }
  }

  private async notifyCaptainOrderCreation(captainOrder: CaptainOrder) {
    const notificationMessage = `Captain Order (${captainOrder.captain_order_number}) has been created & is ready for review.`;
    await Promise.all([this.notifyAdminUser(notificationMessage)]);
  }

  private async notifyCaptainOrderModification(captainOrder: CaptainOrder) {
    const notificationMessage = `Captain Order (${captainOrder.captain_order_number}) has been modified & is ready for review.`;
    await Promise.all([this.notifyAdminUser(notificationMessage)]);
  }

  private async notifyCaptainOrderRemoval(captainOrder: CaptainOrder) {
    const notificationMessage = `Purchase captainOrder (${captainOrder.captain_order_number}) has been deleted.`;
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

  private async notifyRequester(
    notificationMessage: string,
    recipient: number,
  ): Promise<void> {
    const notification = {
      message: notificationMessage,
      recipient: recipient,
      notification_type: NotificationType.INFO,
    };

    await this.notificationsService.create(notification);
    this.wsGateway.server
      .to(String(recipient))
      .emit('notification', notification);
  }
}
