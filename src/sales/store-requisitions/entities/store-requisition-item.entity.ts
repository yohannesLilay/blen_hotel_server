import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { StoreRequisition } from './store-requisition.entity';
import { Product } from 'src/product-management/products/entities/product.entity';

@Entity()
export class StoreRequisitionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  remark: string;

  @ManyToOne(
    () => StoreRequisition,
    (store_requisition) => store_requisition.items,
  )
  store_requisition: StoreRequisition;

  @ManyToOne(() => Product)
  product: Product;
}
