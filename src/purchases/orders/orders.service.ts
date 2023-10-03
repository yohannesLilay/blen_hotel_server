import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

/** DTOs */
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

/** Entities */
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

/** Services */
import { ProductsService } from 'src/configurations/products/products.service';
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
    private readonly entityManager: EntityManager,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const queryRunner = this.entityManager.queryRunner;

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

  async findOneItem(id: number): Promise<OrderItem> {
    return await this.orderItemRepository.findOne({
      where: { id },
    });
  }

  async updateOrder(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

    order.order_number = updateOrderDto.order_number;
    order.order_date = updateOrderDto.order_date;

    return await this.orderRepository.save(order);
  }

  async updateOrderItem(
    id: number,
    updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    const orderItem = await this.findOneItem(id);
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

    order.status = action;
    if (action == OrderStatus.CHECKED)
      order.checked_by = await this.usersService.findOne(userId);
    if (action == OrderStatus.APPROVED)
      order.approved_by = await this.usersService.findOne(userId);

    return await this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found.');

    const queryRunner = this.entityManager.queryRunner;

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

  async removeOrderItem(id: number): Promise<void> {
    const orderItem = await this.findOneItem(id);
    if (!orderItem) throw new NotFoundException('Order Item not found.');

    await this.orderItemRepository.remove(orderItem);
  }
}
