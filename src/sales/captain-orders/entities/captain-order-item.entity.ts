import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CaptainOrder } from './captain-order.entity';
import { Menu } from 'src/configurations/menus/entities/menu.entity';

@Entity()
export class CaptainOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => CaptainOrder, (captain_order) => captain_order.items)
  captain_order: CaptainOrder;

  @ManyToOne(() => Menu)
  menu: Menu;
}
