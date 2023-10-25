import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/security/roles/entities/role.entity';
import { FlowType } from '../constants/flow-type.enum';
import { FlowStep } from '../constants/flow-step.enum';

@Entity()
export class WorkFlow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: FlowType })
  flow_type: FlowType;

  @Column({ type: 'enum', enum: FlowStep })
  step: FlowStep;

  @ManyToMany(() => Role, { nullable: true })
  @JoinTable({
    name: 'workflow_notify_to',
    joinColumn: { name: 'work_flow_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  notify_to: Role[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
