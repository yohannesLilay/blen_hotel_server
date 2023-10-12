import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UnitOfMeasure } from '../constants/unit-of-measure.enum';
import { Category } from 'src/product-management/categories/entities/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: UnitOfMeasure, default: UnitOfMeasure.PIECE })
  unit_of_measure: UnitOfMeasure;

  @Column({ type: 'varchar', length: 200, nullable: true })
  notes: string;

  @Column({ type: 'int', nullable: true })
  safety_stock_level: number;

  @ManyToOne(() => Category)
  category: Category;

  @Column({ type: 'int', nullable: false })
  stock_quantity: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
