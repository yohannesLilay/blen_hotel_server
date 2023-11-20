import { Staff } from 'src/configurations/staffs/entities/staff.entity';
import { User } from 'src/security/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CashReceiptItem } from './cash-receipt-item.entity';
import { CashReceiptStatus } from '../constants/cash-receipt-status.enum';
import { CaptainOrder } from 'src/sales/captain-orders/entities/captain-order.entity';

@Entity()
export class CashReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  cash_receipt_number: string;

  @Column()
  cash_receipt_date: Date;

  @ManyToOne(() => User)
  casher: User;

  @ManyToOne(() => Staff)
  waiter: Staff;

  @OneToMany(() => CashReceiptItem, (item) => item.cash_receipt, {
    cascade: true,
  })
  items: CashReceiptItem[];

  @OneToMany(() => CaptainOrder, (captainOrder) => captainOrder.cash_receipt)
  captain_orders: CaptainOrder[];

  @Column({
    type: 'enum',
    enum: CashReceiptStatus,
    default: CashReceiptStatus.PENDING,
  })
  status: CashReceiptStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
