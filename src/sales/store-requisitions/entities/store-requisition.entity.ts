import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StoreRequisitionItem } from './store-requisition-item.entity';
import { User } from 'src/security/users/entities/user.entity';
import { StoreRequisitionStatus } from '../constants/store-requisition-status.enum';

@Entity()
export class StoreRequisition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  store_requisition_number: string;

  @Column()
  store_requisition_date: Date;

  @OneToMany(() => StoreRequisitionItem, (item) => item.store_requisition, {
    cascade: true,
  })
  items: StoreRequisitionItem[];

  @ManyToOne(() => User)
  requested_by: User;

  @ManyToOne(() => User, { nullable: true })
  approved_by: User;

  @ManyToOne(() => User, { nullable: true })
  released_by: User;

  @Column({
    type: 'enum',
    enum: StoreRequisitionStatus,
    default: StoreRequisitionStatus.REQUESTED,
  })
  status: StoreRequisitionStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
