import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReceivableItem } from './receivable-item.entity';
import { Order } from 'src/purchases/orders/entities/order.entity';
import { User } from 'src/security/users/entities/user.entity';
import { ReceivableStatus } from '../constants/receivable-status.enum';
import { Supplier } from 'src/configurations/suppliers/entities/supplier.entity';

@Entity()
export class Receivable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  receivable_number: string;

  @Column()
  receivable_date: Date;

  @OneToOne(() => Order)
  order: Order;

  @OneToMany(() => ReceivableItem, (item) => item.receivable, {
    cascade: true,
  })
  items: ReceivableItem[];

  @ManyToOne(() => User)
  prepared_by: User;

  @ManyToOne(() => User, { nullable: true })
  received_by: User;

  @ManyToOne(() => Supplier, { nullable: true })
  supplier: Supplier;

  @Column({
    type: 'enum',
    enum: ReceivableStatus,
    default: ReceivableStatus.REQUESTED,
  })
  status: ReceivableStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
