import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

/** DTOs */
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { CreateReceivableItemDto } from './dto/create-receivable-item.dto';
import { UpdateReceivableItemDto } from './dto/update-receivable-item.dto';

/** Entities */
import { Receivable } from './entities/receivable.entity';
import { ReceivableItem } from './entities/receivable-item.entity';

/** Services */
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from 'src/product-management/products/products.service';
import { UsersService } from 'src/security/users/users.service';
import { SuppliersService } from 'src/configurations/suppliers/suppliers.service';

/** Constants */
import { ReceivableStatus } from './constants/receivable-status.enum';

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
      const receivable = this.receivableRepository.create({
        receivable_number: createReceivableDto.receivable_number,
        receivable_date: createReceivableDto.receivable_date,
        status: ReceivableStatus.REQUESTED,
      });
      receivable.prepared_by = await this.usersService.findOne(userId);
      receivable.order = await this.ordersService.findOne(
        createReceivableDto.order_id,
      );
      receivable.supplier = await this.suppliersService.findOne(
        createReceivableDto.supplier_id,
      );

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

      await queryRunner.commitTransaction();

      return savedReceivable;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
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

    return await this.receivableItemRepository.save(receivableItem);
  }

  async findAll(): Promise<Receivable[]> {
    return await this.receivableRepository.find({
      relations: [
        'items',
        'items.product',
        'prepared_by',
        'received_by',
        'supplier',
      ],
    });
  }

  async template() {
    const products = await this.productsService.findAll();
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
        'supplier',
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

    if (receivable.status != ReceivableStatus.REQUESTED)
      throw new NotFoundException('Receivable status does not allow updates.');

    if (receivable.prepared_by?.id != userId)
      throw new NotFoundException(
        'Not allowed to update this purchase receivable.',
      );

    receivable.receivable_number = updateReceivableDto.receivable_number;
    receivable.receivable_date = updateReceivableDto.receivable_date;
    receivable.supplier = await this.suppliersService.findOne(
      updateReceivableDto.supplier_id,
    );

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

    if (receivable.status != ReceivableStatus.REQUESTED)
      throw new NotFoundException('Receivable status does not allow updates.');

    if (receivable.prepared_by?.id != userId)
      throw new NotFoundException(
        'Not allowed to update this purchase receivable.',
      );

    const receivableItem = await this.findOneItem(itemId);
    if (!receivableItem)
      throw new NotFoundException('Receivable Item not found.');

    receivableItem.unit_price = updateReceivableItemDto.unit_price;
    receivableItem.quantity = updateReceivableItemDto.quantity;
    receivableItem.remark = updateReceivableItemDto.remark;
    receivableItem.total_price =
      receivableItem.unit_price * receivableItem.quantity;

    return await this.receivableItemRepository.save(receivableItem);
  }

  async updateReceivableStatus(
    id: number,
    userId: number,
  ): Promise<Receivable> {
    const receivable = await this.findOne(id);
    if (!receivable) throw new NotFoundException('Receivable not found.');

    receivable.received_by = await this.usersService.findOne(userId);
    receivable.status = ReceivableStatus.RECEIVED;

    return await this.receivableRepository.save(receivable);
  }

  async remove(id: number, userId): Promise<void> {
    const receivable = await this.findOne(id);
    if (!receivable) throw new NotFoundException('Receivable not found.');

    if (receivable.status != ReceivableStatus.REQUESTED)
      throw new NotFoundException('This receivable can not be deleted.');

    if (receivable.prepared_by?.id != userId)
      throw new NotFoundException(
        'Not allowed to delete this purchase receivable.',
      );

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.receivableItemRepository.remove(receivable.items);
      await this.receivableRepository.remove(receivable);
    } catch (err) {
      await queryRunner.rollbackTransaction();
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

    if (receivable.status != ReceivableStatus.REQUESTED)
      throw new NotFoundException('This receivables item can not be deleted.');

    if (receivable.prepared_by?.id != userId)
      throw new NotFoundException(
        'Not allowed to delete this purchase receivable.',
      );

    const receivableItem = await this.findOneItem(itemId);
    if (!receivableItem)
      throw new NotFoundException('Receivable Item not found.');

    await this.receivableItemRepository.remove(receivableItem);
  }
}
