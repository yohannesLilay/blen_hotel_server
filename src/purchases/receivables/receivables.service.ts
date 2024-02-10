import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, QueryRunner, Repository } from 'typeorm';

/** DTOs */
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { CreateReceivableItemDto } from './dto/create-receivable-item.dto';
import { UpdateReceivableItemDto } from './dto/update-receivable-item.dto';
import { RejectReceivableDto } from './dto/reject-receivable.dto';

/** Entities */
import { Receivable } from './entities/receivable.entity';
import { ReceivableItem } from './entities/receivable-item.entity';

/** Services */
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from 'src/product-management/products/products.service';
import { UsersService } from 'src/security/users/users.service';
import { SuppliersService } from 'src/configurations/suppliers/suppliers.service';
import { WorkFlowsService } from 'src/configurations/work-flows/work-flows.service';
import { NotificationsService } from 'src/notifications/notifications.service';

/** Constants */
import { ReceivableStatus } from './constants/receivable-status.enum';
import { NotificationType } from 'src/notifications/constants/notification-type.enum';
import { FlowType } from 'src/configurations/work-flows/constants/flow-type.enum';
import { FlowStep } from 'src/configurations/work-flows/constants/flow-step.enum';
import { ProductStockOperation } from 'src/product-management/products/constants/product-stock-operation.enum';

/** Gateways */
import { WebSocketsGateway } from 'src/web-sockets/web-sockets.gateway';

@Injectable()
export class ReceivablesService {
  constructor(
    @InjectRepository(Receivable)
    private readonly receivableRepository: Repository<Receivable>,
    @InjectRepository(ReceivableItem)
    private readonly receivableItemRepository: Repository<ReceivableItem>,
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly suppliersService: SuppliersService,
    private readonly workFlowsService: WorkFlowsService,
    private readonly notificationsService: NotificationsService,
    private readonly wsGateway: WebSocketsGateway,
    private dataSource: DataSource,
  ) {}

  async create(
    createReceivableDto: CreateReceivableDto,
    userId: number,
  ): Promise<Receivable> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('here');
      const savedReceivable = await this.createReceivable(
        createReceivableDto,
        userId,
        queryRunner,
      );
      await this.notifyReceivableCreation(savedReceivable);

      await queryRunner.commitTransaction();
      return savedReceivable;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'An error occurred while creating purchase receivable(GRV).',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async createReceivable(
    createReceivableDto: CreateReceivableDto,
    userId: number,
    queryRunner: QueryRunner,
  ): Promise<Receivable> {
    const receivableNumber = await this.generateUniqueReceivableNumber();
    const receivable = this.receivableRepository.create({
      receivable_number: receivableNumber,
      receivable_date: createReceivableDto.receivable_date,
      status: ReceivableStatus.REQUESTED,
    });

    receivable.prepared_by = await this.usersService.findOne(userId);
    receivable.order = createReceivableDto.order_id
      ? await this.ordersService.findOne(createReceivableDto.order_id)
      : null;
    receivable.supplier = createReceivableDto.supplier_id
      ? await this.suppliersService.findOne(createReceivableDto?.supplier_id)
      : null;
    const savedReceivable = await queryRunner.manager.save(
      Receivable,
      receivable,
    );

    for (const item of createReceivableDto.items) {
      const receivableItem = this.receivableItemRepository.create({
        receivable: savedReceivable,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
        remark: item.remark,
      });
      receivableItem.product = await this.productsService.findOne(
        item.product_id,
      );
      await queryRunner.manager.save(ReceivableItem, receivableItem);
    }

    return savedReceivable;
  }

  async createReceivableItem(
    id: number,
    createReceivableItemDto: CreateReceivableItemDto,
  ): Promise<ReceivableItem> {
    const receivable = await this.findOne(id);
    if (!receivable) throw new NotFoundException('Receivable not found.');

    const receivableItem = this.receivableItemRepository.create({
      receivable,
      unit_price: createReceivableItemDto.unit_price,
      quantity: createReceivableItemDto.quantity,
      total_price:
        createReceivableItemDto.unit_price * createReceivableItemDto.quantity,
      remark: createReceivableItemDto.remark,
    });
    receivableItem.product = await this.productsService.findOne(
      createReceivableItemDto.product_id,
    );

    await this.notifyReceivableModification(receivable);

    return await this.receivableItemRepository.save(receivableItem);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    receivables: Receivable[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [receivables, total] = await this.receivableRepository.findAndCount({
      relations: [
        'items',
        'items.product',
        'prepared_by',
        'received_by',
        'rejected_by',
        'supplier',
        'order',
      ],
      where: search ? [{ receivable_number: ILike(`%${search}%`) }] : {},
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { receivables, total, currentPage, totalPages };
  }

  async template() {
    const products = await this.productsService.findAllList();
    const orders = await this.ordersService.findApprovedOrders();
    const suppliers = await this.suppliersService.findAll();
    return {
      productOptions: products,
      orderOptions: orders,
      supplierOptions: suppliers,
    };
  }

  async findOne(id: number): Promise<Receivable> {
    return await this.receivableRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.product',
        'prepared_by',
        'received_by',
        'rejected_by',
        'supplier',
        'order',
      ],
    });
  }

  async findByReceivableNumber(receivableNumber: string): Promise<Receivable> {
    return await this.receivableRepository.findOne({
      where: { receivable_number: receivableNumber },
    });
  }

  async findOneItem(id: number): Promise<ReceivableItem> {
    return await this.receivableItemRepository.findOne({
      where: { id },
    });
  }

  async updateReceivable(
    id: number,
    updateReceivableDto: UpdateReceivableDto,
    userId: number,
  ): Promise<Receivable> {
    const receivable = await this.findOne(id);
    if (!receivable) throw new NotFoundException('Receivable not found.');

    this.checkReceivableForUpdate(receivable, userId);

    receivable.receivable_date = updateReceivableDto.receivable_date;
    receivable.supplier =
      updateReceivableDto.supplier_id !== null
        ? await this.suppliersService.findOne(updateReceivableDto?.supplier_id)
        : null;
    receivable.status = ReceivableStatus.REQUESTED;

    this.notifyReceivableModification(receivable);

    return await this.receivableRepository.save(receivable);
  }

  async updateReceivableItem(
    id: number,
    itemId: number,
    updateReceivableItemDto: UpdateReceivableItemDto,
    userId: number,
  ): Promise<ReceivableItem> {
    const receivable = await this.findOne(id);
    if (!receivable) throw new NotFoundException('Receivable not found.');

    this.checkReceivableForUpdate(receivable, userId);

    const receivableItem = await this.findOneItem(itemId);
    if (!receivableItem)
      throw new NotFoundException('Receivable Item not found.');

    receivable.status = ReceivableStatus.REQUESTED;

    receivableItem.unit_price = updateReceivableItemDto.unit_price;
    receivableItem.quantity = updateReceivableItemDto.quantity;
    receivableItem.remark = updateReceivableItemDto.remark;
    receivableItem.total_price =
      receivableItem.unit_price * receivableItem.quantity;

    this.notifyReceivableModification(receivable);

    await this.receivableRepository.save(receivable);
    return await this.receivableItemRepository.save(receivableItem);
  }

  async approve(id: number, userId: number) {
    const receivable = await this.findOne(id);
    if (!receivable) throw new NotFoundException('Receivable not found');

    receivable.received_by = await this.usersService.findOne(userId);
    receivable.status = ReceivableStatus.RECEIVED;

    await this.updateProductsStockQuantity(receivable.items);

    await this.notifyReceivableAction(receivable);

    return await this.receivableRepository.save(receivable);
  }

  async rejectReceivable(
    id: number,
    rejectReceivableDto: RejectReceivableDto,
    userId: number,
  ): Promise<Receivable> {
    const receivable = await this.findOne(id);
    if (!receivable) throw new NotFoundException('Receivable not found.');

    this.checkReceivableForRejection(receivable);

    receivable.rejection_reason = rejectReceivableDto.rejection_reason;
    receivable.rejected_by = await this.usersService.findOne(userId);
    receivable.status = ReceivableStatus.REJECTED;

    await this.notifyReceivableRejection(receivable);

    return await this.receivableRepository.save(receivable);
  }

  async remove(id: number, userId): Promise<void> {
    const receivable = await this.findOne(id);
    if (!receivable) throw new NotFoundException('Receivable not found.');

    this.checkReceivableForDelete(receivable, userId);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.notifyReceivableRemoval(receivable);
      await this.receivableItemRepository.remove(receivable.items);
      await this.receivableRepository.remove(receivable);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'An error occurred while deleting the purchase receivable(GRV).',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async removeReceivableItem(
    id: number,
    itemId: number,
    userId: number,
  ): Promise<void> {
    const receivable = await this.findOne(id);
    if (!receivable) throw new NotFoundException('Receivable not found.');

    this.checkReceivableForDelete(receivable, userId);

    receivable.status = ReceivableStatus.REQUESTED;

    const receivableItem = await this.findOneItem(itemId);
    if (!receivableItem)
      throw new NotFoundException('Receivable Item not found.');

    this.notifyReceivableModification(receivable);

    await this.receivableRepository.save(receivable);

    await this.receivableItemRepository.remove(receivableItem);
  }

  private checkReceivableForUpdate(receivable: Receivable, userId: number) {
    if (
      receivable.status != ReceivableStatus.REQUESTED &&
      receivable.status != ReceivableStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Receivable status does not allow updates.',
      );
    }

    if (receivable.prepared_by?.id != userId) {
      throw new BadRequestException(
        'Not allowed to update this purchase receivable.',
      );
    }
  }

  private checkReceivableForDelete(receivable: Receivable, userId: number) {
    if (
      receivable.status != ReceivableStatus.REQUESTED &&
      receivable.status != ReceivableStatus.REJECTED
    ) {
      throw new BadRequestException(
        'This receivables item can not be deleted.',
      );
    }

    if (receivable.prepared_by?.id != userId) {
      throw new BadRequestException(
        'Not allowed to delete this purchase receivable.',
      );
    }
  }

  private checkReceivableForRejection(receivable: Receivable) {
    if (
      receivable.status == ReceivableStatus.REJECTED ||
      receivable.status == ReceivableStatus.RECEIVED
    ) {
      throw new BadRequestException(
        'Receivable status does not allow rejection.',
      );
    }
  }

  private async updateProductsStockQuantity(receivableItems: ReceivableItem[]) {
    for (const item of receivableItems) {
      await this.productsService.updateStockQuantity({
        operation: ProductStockOperation.IN,
        quantity: item.quantity,
        product_id: item.product.id,
      });
    }
  }

  private async notifyReceivableCreation(receivable: Receivable) {
    const notificationMessage = `Purchase receivable (${receivable.receivable_number}) has been created & is ready for review.`;
    await Promise.all([
      this.notifyUsers(notificationMessage, FlowStep.REQUEST),
      this.notifyAdminUser(notificationMessage),
    ]);
  }

  private async notifyReceivableModification(receivable: Receivable) {
    const notificationMessage = `Purchase receivable (${receivable.receivable_number}) has been modified & is ready for review.`;
    await Promise.all([
      this.notifyUsers(notificationMessage, FlowStep.REQUEST),
      this.notifyAdminUser(notificationMessage),
    ]);
  }

  private async notifyReceivableRejection(receivable: Receivable) {
    const notificationMessage = `Requested Purchase receivable with receivable number (${receivable.receivable_number}) has been rejected by ${receivable.rejected_by.name} with a reason ${receivable.rejection_reason}.`;
    await Promise.all([
      this.notifyAdminUser(notificationMessage),
      this.notifyRequester(notificationMessage, receivable.prepared_by.id),
    ]);
  }

  private async notifyReceivableAction(receivable: Receivable) {
    const notificationMessage = `Purchase receivable ${receivable.receivable_number} has been approved by ${receivable.received_by.name}.`;
    await Promise.all([
      this.notifyUsers(notificationMessage, FlowStep.APPROVE),
      this.notifyAdminUser(notificationMessage),
      this.notifyRequester(
        `Your purchase receivable (${receivable.receivable_number}) has been successfully approved by ${receivable.received_by.name}`,
        receivable.prepared_by.id,
      ),
    ]);
  }

  private async notifyReceivableRemoval(receivable: Receivable) {
    const notificationMessage = `Purchase receivable (${receivable.receivable_number}) has been deleted.`;
    await this.notifyUsers(notificationMessage, FlowStep.REQUEST);
    await this.notifyAdminUser(notificationMessage);
  }

  private async notifyUsers(
    notificationMessage: string,
    flowStep: FlowStep,
  ): Promise<void> {
    const workFlow = await this.workFlowsService.findByFlowTypeAndStep(
      FlowType.PURCHASE_RECEIVABLE,
      flowStep,
    );

    if (workFlow) {
      const rolesToNotify = workFlow.notify_to;
      const usersToNotify = await this.usersService.findByRoles(
        rolesToNotify.map((role) => role.id),
      );

      for (const user of usersToNotify) {
        const notification = {
          message: notificationMessage,
          recipient: user.id,
          notification_type: NotificationType.ACTION,
        };

        await this.notificationsService.create(notification);
        this.wsGateway.server
          .to(String(user.id))
          .emit('notification', notification);
      }
    }
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

  async getActiveOrderCount(): Promise<number> {
    return await this.receivableRepository.count({
      where: {
        status: ReceivableStatus.REQUESTED,
      },
    });
  }

  private async generateUniqueReceivableNumber(): Promise<string> {
    const latestReceivable = await this.receivableRepository.find({
      order: { created_at: 'DESC' },
      take: 1,
    });

    const startingNumber =
      latestReceivable.length > 0
        ? parseInt(latestReceivable[0].receivable_number.slice(3)) + 1
        : 1;

    const sequentialNumber = startingNumber.toString().padStart(5, '0');
    const receivableNumber = `RN-${sequentialNumber}`;

    return receivableNumber;
  }
}
