import { Room } from 'src/configurations/rooms/entities/room.entity';
import { User } from 'src/security/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BookRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  book_date: Date;

  @ManyToOne(() => Room)
  room: Room;

  @ManyToOne(() => User)
  operator: User;

  @Column({ type: 'varchar', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  guest_in: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
