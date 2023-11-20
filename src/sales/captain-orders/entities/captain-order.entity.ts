import { FacilityType } from 'src/configurations/facility-types/entities/facility-type.entity';
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
import { CaptainOrderStatus } from '../constants/captain-order-status.enum';
import { CaptainOrderItem } from './captain-order-item.entity';
import { CashReceipt } from 'src/sales/cash-receipts/entities/cash-receipt.entity';

@Entity()
export class CaptainOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  captain_order_number: string;

  @Column()
  captain_order_date: Date;

  @ManyToOne(() => User)
  created_by: User;

  @ManyToOne(() => Staff)
  waiter: Staff;

  @ManyToOne(() => FacilityType)
  facility_type: FacilityType;

  @OneToMany(() => CaptainOrderItem, (item) => item.captain_order, {
    cascade: true,
  })
  items: CaptainOrderItem[];

  @ManyToOne(() => CashReceipt, (cashReceipt) => cashReceipt.captain_orders, {
    nullable: true,
  })
  cash_receipt: CashReceipt;

  @Column({
    type: 'enum',
    enum: CaptainOrderStatus,
    default: CaptainOrderStatus.PENDING,
  })
  status: CaptainOrderStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
