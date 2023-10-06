import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

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

/** Constants */
import { OrderStatus } from './constants/OrderStatus.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      await queryRunner.commitTransaction();

      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async createOrderItem(
    id: number,
    createOrderItemDto: CreateOrderItemDto,
  ): Promise<OrderItem> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

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

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: [
        'items',
        'items.product',
        'requested_by',
        'checked_by',
        'approved_by',
      ],
    });
  }

  async template() {
    const products = await this.productsService.findAll();
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

    if (order.status != OrderStatus.REQUESTED)
      throw new NotFoundException('Order status does not allow updates.');

    if (order.requested_by?.id != userId)
      throw new NotFoundException('Not allowed to update this purchase order.');

    order.order_number = updateOrderDto.order_number;
    order.order_date = updateOrderDto.order_date;

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

    if (order.status != OrderStatus.REQUESTED)
      throw new NotFoundException('Order status does not allow updates.');

    if (order.requested_by?.id != userId)
      throw new NotFoundException('Not allowed to update this purchase order.');

    const orderItem = await this.findOneItem(itemId);
    if (!orderItem) throw new NotFoundException('Order Item not found.');

    orderItem.unit_price = updateOrderItemDto.unit_price;
    orderItem.quantity = updateOrderItemDto.quantity;
    orderItem.remark = updateOrderItemDto.remark;
    orderItem.total_price = orderItem.unit_price * orderItem.quantity;

    return await this.orderItemRepository.save(orderItem);
  }

  async updateOrderStatus(
    id: number,
    action: OrderStatus,
    userId: number,
  ): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

    if (order.status === action)
      throw new NotFoundException('Operation not allowed.');

    switch (action) {
      case OrderStatus.CHECKED:
        order.checked_by = await this.usersService.findOne(userId);
        break;
      case OrderStatus.APPROVED:
        order.approved_by = await this.usersService.findOne(userId);
      default:
        break;
    }
    order.status = action;

    return await this.orderRepository.save(order);
  }

  async remove(id: number, userId): Promise<void> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

    if (order.status != OrderStatus.REQUESTED)
      throw new NotFoundException('This order can not be deleted.');

    if (order.requested_by?.id != userId)
      throw new NotFoundException('Not allowed to delete this purchase order.');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.orderItemRepository.remove(order.items);
      await this.orderRepository.remove(order);
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

    if (order.status != OrderStatus.REQUESTED)
      throw new NotFoundException('This orders item can not be deleted.');

    if (order.requested_by?.id != userId)
      throw new NotFoundException('Not allowed to delete this purchase order.');

    const orderItem = await this.findOneItem(itemId);
    if (!orderItem) throw new NotFoundException('Order Item not found.');

    await this.orderItemRepository.remove(orderItem);
  }
}
