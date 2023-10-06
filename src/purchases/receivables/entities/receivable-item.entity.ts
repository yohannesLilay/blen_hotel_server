import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Receivable } from './receivable.entity';
import { Product } from 'src/configurations/products/entities/product.entity';

@Entity()
export class ReceivableItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  unit_price: number;

  @Column()
  total_price: number;

  @Column({ type: 'varchar', nullable: true })
  remark: string;

  @ManyToOne(() => Receivable, (receivable) => receivable.items)
  receivable: Receivable;

  @ManyToOne(() => Product)
  product: Product;
}
