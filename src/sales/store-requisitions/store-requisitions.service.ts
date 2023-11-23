import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, QueryRunner, Repository } from 'typeorm';

/** DTOs */
import { CreateStoreRequisitionDto } from './dto/create-store-requisition.dto';
import { UpdateStoreRequisitionDto } from './dto/update-store-requisition.dto';
import { CreateStoreRequisitionItemDto } from './dto/create-store-requisition-item.dto';
import { UpdateStoreRequisitionItemDto } from './dto/update-store-requisition-item.dto';

/** Entities */
import { StoreRequisition } from './entities/store-requisition.entity';
import { StoreRequisitionItem } from './entities/store-requisition-item.entity';

/** Services */
import { ProductsService } from 'src/product-management/products/products.service';
import { UsersService } from 'src/security/users/users.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { WorkFlowsService } from 'src/configurations/work-flows/work-flows.service';

/** Constants */
import { StoreRequisitionStatus } from './constants/store-requisition-status.enum';
import { FlowType } from 'src/configurations/work-flows/constants/flow-type.enum';
import { FlowStep } from 'src/configurations/work-flows/constants/flow-step.enum';
import { NotificationType } from 'src/notifications/constants/notification-type.enum';
import { ProductStockOperation } from 'src/product-management/products/constants/product-stock-operation.enum';

/** Gateways */
import { WebSocketsGateway } from 'src/web-sockets/web-sockets.gateway';

@Injectable()
export class StoreRequisitionsService {
  constructor(
    @InjectRepository(StoreRequisition)
    private readonly storeRequisitionRepository: Repository<StoreRequisition>,
    @InjectRepository(StoreRequisitionItem)
    private readonly storeRequisitionItemRepository: Repository<StoreRequisitionItem>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly workFlowsService: WorkFlowsService,
    private readonly wsGateway: WebSocketsGateway,
    private dataSource: DataSource,
  ) {}

  async create(
    createStoreRequisitionDto: CreateStoreRequisitionDto,
    userId: number,
  ): Promise<StoreRequisition> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedStoreRequisition = await this.createStoreRequisition(
        createStoreRequisitionDto,
        userId,
        queryRunner,
      );
      await this.notifyStoreRequisitionCreation(savedStoreRequisition);

      await queryRunner.commitTransaction();
      return savedStoreRequisition;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async createStoreRequisition(
    createStoreRequisitionDto: CreateStoreRequisitionDto,
    userId: number,
    queryRunner: QueryRunner,
  ): Promise<StoreRequisition> {
    const storeRequisition = this.storeRequisitionRepository.create({
      store_requisition_number:
        createStoreRequisitionDto.store_requisition_number,
      store_requisition_date: createStoreRequisitionDto.store_requisition_date,
      status: StoreRequisitionStatus.REQUESTED,
    });

    storeRequisition.requested_by = await this.usersService.findOne(userId);
    const savedStoreRequisition = await queryRunner.manager.save(
      StoreRequisition,
      storeRequisition,
    );

    for (const item of createStoreRequisitionDto.items) {
      const storeRequisitionItem = this.storeRequisitionItemRepository.create({
        store_requisition: savedStoreRequisition,
        quantity: item.quantity,
        remark: item.remark,
      });
      storeRequisitionItem.product = await this.productsService.findOne(
        item.product_id,
      );
      await queryRunner.manager.save(
        StoreRequisitionItem,
        storeRequisitionItem,
      );
    }

    return savedStoreRequisition;
  }

  async createStoreRequisitionItem(
    id: number,
    createStoreRequisitionItemDto: CreateStoreRequisitionItemDto,
  ): Promise<StoreRequisitionItem> {
    const storeRequisition = await this.findOne(id);
    if (!storeRequisition)
      throw new NotFoundException('Store Requisition not found.');

    if (storeRequisition.status !== StoreRequisitionStatus.REQUESTED)
      throw new BadRequestException(
        'It is not allowed to add a new store requisition item.',
      );

    const storeRequisitionItem = this.storeRequisitionItemRepository.create({
      store_requisition: storeRequisition,
      quantity: createStoreRequisitionItemDto.quantity,
      remark: createStoreRequisitionItemDto.remark,
    });
    storeRequisitionItem.product = await this.productsService.findOne(
      createStoreRequisitionItemDto.product_id,
    );

    await this.notifyStoreRequisitionModification(storeRequisition);

    return await this.storeRequisitionItemRepository.save(storeRequisitionItem);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    storeRequisitions: StoreRequisition[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [storeRequisitions, total] =
      await this.storeRequisitionRepository.findAndCount({
        relations: ['items', 'items.product', 'requested_by', 'approved_by'],
        where: search
          ? [{ store_requisition_number: ILike(`%${search}%`) }]
          : {},
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { storeRequisitions, total, currentPage, totalPages };
  }

  async template() {
    const products = await this.productsService.findAllList();
    return { productOptions: products };
  }

  async findOne(id: number): Promise<StoreRequisition> {
    return await this.storeRequisitionRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'requested_by', 'approved_by'],
    });
  }

  async findByStoreRequisitionNumber(
    storeRequisitionNumber: string,
  ): Promise<StoreRequisition> {
    return await this.storeRequisitionRepository.findOne({
      where: { store_requisition_number: storeRequisitionNumber },
    });
  }

  async findApprovedStoreRequisitions(): Promise<StoreRequisition[]> {
    return await this.storeRequisitionRepository.find({
      relations: ['items', 'items.product'],
      where: { status: StoreRequisitionStatus.APPROVED },
    });
  }

  async findOneItem(id: number): Promise<StoreRequisitionItem> {
    return await this.storeRequisitionItemRepository.findOne({
      where: { id },
    });
  }

  async updateStoreRequisition(
    id: number,
    updateStoreRequisitionDto: UpdateStoreRequisitionDto,
    userId: number,
  ): Promise<StoreRequisition> {
    const storeRequisition = await this.findOne(id);
    if (!storeRequisition)
      throw new NotFoundException('Store Requisition not found.');

    this.checkStoreRequisitionForUpdate(storeRequisition, userId);

    storeRequisition.store_requisition_number =
      updateStoreRequisitionDto.store_requisition_number;
    storeRequisition.store_requisition_date =
      updateStoreRequisitionDto.store_requisition_date;

    await this.notifyStoreRequisitionModification(storeRequisition);

    return await this.storeRequisitionRepository.save(storeRequisition);
  }

  async updateStoreRequisitionItem(
    id: number,
    itemId: number,
    updateStoreRequisitionItemDto: UpdateStoreRequisitionItemDto,
    userId: number,
  ): Promise<StoreRequisitionItem> {
    const storeRequisition = await this.findOne(id);
    if (!storeRequisition)
      throw new NotFoundException('Store Requisition not found.');

    this.checkStoreRequisitionForUpdate(storeRequisition, userId);

    const storeRequisitionItem = await this.findOneItem(itemId);
    if (!storeRequisitionItem)
      throw new NotFoundException('Store Requisition Item not found.');

    storeRequisitionItem.quantity = updateStoreRequisitionItemDto.quantity;
    storeRequisitionItem.remark = updateStoreRequisitionItemDto.remark;

    await this.notifyStoreRequisitionModification(storeRequisition);

    return await this.storeRequisitionItemRepository.save(storeRequisitionItem);
  }

  async approveOrRelease(id: number, userId: number, isApproval: boolean) {
    const storeRequisition = await this.findOne(id);
    if (!storeRequisition)
      throw new NotFoundException('Store Requisition not found');

    const actor = isApproval ? 'approved' : 'released';

    storeRequisition[`${actor}_by`] = await this.usersService.findOne(userId);
    storeRequisition.status = isApproval
      ? StoreRequisitionStatus.APPROVED
      : StoreRequisitionStatus.RELEASED;

    if (!isApproval) {
      await this.updateProductsStockQuantity(storeRequisition.items);
    }
    await this.notifyStoreRequisitionAction(
      storeRequisition,
      actor,
      isApproval,
    );

    return await this.storeRequisitionRepository.save(storeRequisition);
  }

  async remove(id: number, userId): Promise<void> {
    const storeRequisition = await this.findOne(id);
    if (!storeRequisition)
      throw new NotFoundException('Store Requisition not found.');

    this.checkStoreRequisitionForDelete(storeRequisition, userId);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.notifyStoreRequisitionRemoval(storeRequisition);
      await this.storeRequisitionItemRepository.remove(storeRequisition.items);
      await this.storeRequisitionRepository.remove(storeRequisition);
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async removeStoreRequisitionItem(
    id: number,
    itemId: number,
    userId: number,
  ): Promise<void> {
    const storeRequisition = await this.findOne(id);
    if (!storeRequisition)
      throw new NotFoundException('Store Requisition not found.');

    this.checkStoreRequisitionForDelete(storeRequisition, userId);

    const storeRequisitionItem = await this.findOneItem(itemId);
    if (!storeRequisitionItem)
      throw new NotFoundException('Store Requisition Item not found.');

    this.notifyStoreRequisitionModification(storeRequisition);

    await this.storeRequisitionItemRepository.remove(storeRequisitionItem);
  }

  private checkStoreRequisitionForUpdate(
    storeRequisition: StoreRequisition,
    userId: number,
  ) {
    if (storeRequisition.status != StoreRequisitionStatus.REQUESTED) {
      throw new BadRequestException(
        'Store requisition status does not allow updates.',
      );
    }

    if (storeRequisition.requested_by?.id != userId) {
      throw new BadRequestException(
        'Not allowed to update this store requisition.',
      );
    }
  }

  private checkStoreRequisitionForDelete(
    storeRequisition: StoreRequisition,
    userId: number,
  ) {
    if (storeRequisition.status != StoreRequisitionStatus.REQUESTED) {
      throw new BadRequestException(
        'This store requisitions item can not be deleted.',
      );
    }

    if (storeRequisition.requested_by?.id != userId) {
      throw new BadRequestException(
        'Not allowed to delete this store requisition.',
      );
    }
  }

  private async updateProductsStockQuantity(
    storeRequisitionItems: StoreRequisitionItem[],
  ) {
    for (const item of storeRequisitionItems) {
      await this.productsService.updateStockQuantity({
        operation: ProductStockOperation.OUT,
        quantity: item.quantity,
        product_id: item.product.id,
      });
    }
  }

  private async notifyStoreRequisitionCreation(
    storeRequisition: StoreRequisition,
  ) {
    const notificationMessage = `Store Requisition (${storeRequisition.store_requisition_number}) has been created & is ready for review.`;
    await Promise.all([
      this.notifyUsers(notificationMessage, FlowStep.REQUEST),
      this.notifyAdminUser(notificationMessage),
    ]);
  }

  private async notifyStoreRequisitionModification(
    storeRequisition: StoreRequisition,
  ) {
    const notificationMessage = `Store Requisition (${storeRequisition.store_requisition_number}) has been modified & is ready for review.`;
    await Promise.all([
      this.notifyUsers(notificationMessage, FlowStep.REQUEST),
      this.notifyAdminUser(notificationMessage),
    ]);
  }

  private async notifyStoreRequisitionAction(
    storeRequisition: StoreRequisition,
    actor: string,
    isApproval: boolean,
  ) {
    const action = isApproval ? 'approved' : 'checked';

    const notificationMessage = `store requisition ${
      storeRequisition.store_requisition_number
    } has been ${action} by ${storeRequisition[`${actor}_by`].name}.`;
    await Promise.all([
      this.notifyUsers(
        notificationMessage,
        isApproval ? FlowStep.APPROVE : FlowStep.RELEASE,
      ),
      this.notifyAdminUser(notificationMessage),
      this.notifyRequester(
        `Your store requisition (${
          storeRequisition.store_requisition_number
        }) has been successfully ${action} by ${
          storeRequisition[`${actor}_by`].name
        }`,
        storeRequisition.requested_by.id,
      ),
    ]);
  }

  private async notifyStoreRequisitionRemoval(
    storeRequisition: StoreRequisition,
  ) {
    const notificationMessage = `Purchase storeRequisition (${storeRequisition.store_requisition_number}) has been deleted.`;
    await this.notifyUsers(notificationMessage, FlowStep.REQUEST);
    await this.notifyAdminUser(notificationMessage);
  }

  private async notifyUsers(
    notificationMessage: string,
    flowStep: FlowStep,
  ): Promise<void> {
    const workFlow = await this.workFlowsService.findByFlowTypeAndStep(
      FlowType.STORE_REQUISITION,
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

  async getActiveStoreRequisitionCount(): Promise<number> {
    return await this.storeRequisitionRepository.count({
      where: {
        status: StoreRequisitionStatus.REQUESTED,
      },
    });
  }
}
