import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, QueryRunner, Repository } from 'typeorm';

/** DTOs */
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

/** Entities */
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

/** Services */
import { ProductsService } from 'src/product-management/products/products.service';
import { UsersService } from 'src/security/users/users.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { WorkFlowsService } from 'src/configurations/work-flows/work-flows.service';

/** Constants */
import { OrderStatus } from './constants/OrderStatus.enum';
import { FlowType } from 'src/configurations/work-flows/constants/flow-type.enum';
import { FlowStep } from 'src/configurations/work-flows/constants/flow-step.enum';
import { NotificationType } from 'src/notifications/constants/notification-type.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly workFlowsService: WorkFlowsService,
    private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedOrder = await this.createOrder(
        createOrderDto,
        userId,
        queryRunner,
      );
      await this.notifyOrderCreation(savedOrder);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async createOrder(
    createOrderDto: CreateOrderDto,
    userId: number,
    queryRunner: QueryRunner,
  ): Promise<Order> {
    const order = this.orderRepository.create({
      order_number: createOrderDto.order_number,
      order_date: createOrderDto.order_date,
      status: OrderStatus.REQUESTED,
    });

    order.requested_by = await this.usersService.findOne(userId);
    const savedOrder = await queryRunner.manager.save(Order, order);

    for (const item of createOrderDto.items) {
      const orderItem = this.orderItemRepository.create({
        order: savedOrder,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
        remark: item.remark,
      });
      orderItem.product = await this.productsService.findOne(item.product_id);
      await queryRunner.manager.save(OrderItem, orderItem);
    }

    return savedOrder;
  }

  async createOrderItem(
    id: number,
    createOrderItemDto: CreateOrderItemDto,
  ): Promise<OrderItem> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

    if (order.status !== OrderStatus.REQUESTED)
      throw new BadRequestException(
        'It is not allowed to add a new order item.',
      );

    const orderItem = this.orderItemRepository.create({
      order,
      unit_price: createOrderItemDto.unit_price,
      quantity: createOrderItemDto.quantity,
      total_price: createOrderItemDto.unit_price * createOrderItemDto.quantity,
      remark: createOrderItemDto.remark,
    });
    orderItem.product = await this.productsService.findOne(
      createOrderItemDto.product_id,
    );

    return await this.orderItemRepository.save(orderItem);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    orders: Order[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      relations: [
        'items',
        'items.product',
        'requested_by',
        'checked_by',
        'approved_by',
      ],
      where: search ? [{ order_number: ILike(`%${search}%`) }] : {},
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { orders, total, currentPage, totalPages };
  }

  async template() {
    const products = await this.productsService.findAllList();
    return { productOptions: products };
  }

  async findOne(id: number): Promise<Order> {
    return await this.orderRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.product',
        'requested_by',
        'checked_by',
        'approved_by',
      ],
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    return await this.orderRepository.findOne({
      where: { order_number: orderNumber },
    });
  }

  async findApprovedOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { status: OrderStatus.APPROVED },
    });
  }

  async findOneItem(id: number): Promise<OrderItem> {
    return await this.orderItemRepository.findOne({
      where: { id },
    });
  }

  async updateOrder(
    id: number,
    updateOrderDto: UpdateOrderDto,
    userId: number,
  ): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

    this.checkOrderForUpdate(order, userId);

    order.order_number = updateOrderDto.order_number;
    order.order_date = updateOrderDto.order_date;

    await this.notifyOrderModification(order);

    return await this.orderRepository.save(order);
  }

  async updateOrderItem(
    id: number,
    itemId: number,
    updateOrderItemDto: UpdateOrderItemDto,
    userId: number,
  ): Promise<OrderItem> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

    this.checkOrderForUpdate(order, userId);

    const orderItem = await this.findOneItem(itemId);
    if (!orderItem) throw new NotFoundException('Order Item not found.');

    orderItem.unit_price = updateOrderItemDto.unit_price;
    orderItem.quantity = updateOrderItemDto.quantity;
    orderItem.remark = updateOrderItemDto.remark;
    orderItem.total_price = orderItem.unit_price * orderItem.quantity;

    await this.notifyOrderModification(order);

    return await this.orderItemRepository.save(orderItem);
  }

  async checkOrApprove(id: number, userId: number, isApproval: boolean) {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found');

    const action = isApproval ? 'approved' : 'checked';
    const actor = isApproval ? 'approved' : 'checked';

    order[`${actor}_by`] = await this.usersService.findOne(userId);
    order.status = isApproval ? OrderStatus.APPROVED : OrderStatus.CHECKED;

    await this.notifyOrderAction(order, action, actor);

    return await this.orderRepository.save(order);
  }

  async remove(id: number, userId): Promise<void> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

    this.checkOrderForDelete(order, userId);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.orderItemRepository.remove(order.items);
      await this.orderRepository.remove(order);

      const notificationMessage = `Purchase order (${order.order_number}) has been deleted.`;
      await this.notifyUsers(notificationMessage);
      await this.notifyAdminUser(notificationMessage);
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async removeOrderItem(
    id: number,
    itemId: number,
    userId: number,
  ): Promise<void> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

    this.checkOrderForDelete(order, userId);

    const orderItem = await this.findOneItem(itemId);
    if (!orderItem) throw new NotFoundException('Order Item not found.');

    await this.orderItemRepository.remove(orderItem);
  }

  private checkOrderForUpdate(order: Order, userId: number) {
    if (order.status != OrderStatus.REQUESTED) {
      throw new BadRequestException('Order status does not allow updates.');
    }

    if (order.requested_by?.id != userId) {
      throw new BadRequestException(
        'Not allowed to update this purchase order.',
      );
    }
  }

  private checkOrderForDelete(order: Order, userId: number) {
    if (order.status != OrderStatus.REQUESTED) {
      throw new BadRequestException('This orders item can not be deleted.');
    }

    if (order.requested_by?.id != userId) {
      throw new BadRequestException(
        'Not allowed to delete this purchase order.',
      );
    }
  }

  private async notifyOrderCreation(order: Order) {
    const notificationMessage = `Purchase order (${order.order_number}) has been created & is ready for review.`;
    await Promise.all([
      this.notifyUsers(notificationMessage),
      this.notifyAdminUser(notificationMessage),
    ]);
  }

  private async notifyOrderModification(order: Order) {
    const notificationMessage = `Purchase order (${order.order_number}) has been modified & is ready for review.`;
    await Promise.all([
      this.notifyUsers(notificationMessage),
      this.notifyAdminUser(notificationMessage),
    ]);
  }

  private async notifyOrderAction(order: Order, action: string, actor: string) {
    const notificationMessage = `Purchase order ${
      order.order_number
    } has been ${action} by ${order[`${actor}_by`].name}.`;
    await Promise.all([
      this.notifyUsers(notificationMessage),
      this.notifyAdminUser(notificationMessage),
      this.notifyRequester(
        `Your purchase order (${
          order.order_number
        }) has been successfully ${action} by ${order[`${actor}_by`].name}`,
        order.requested_by.id,
      ),
    ]);
  }

  private async notifyUsers(notificationMessage: string): Promise<void> {
    const workFlow = await this.workFlowsService.findByFlowTypeAndStep(
      FlowType.PURCHASE_ORDER,
      FlowStep.REQUEST,
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
  }
}
