import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CashReceipt } from './cash-receipt.entity';
import { Menu } from 'src/configurations/menus/entities/menu.entity';

@Entity()
export class CashReceiptItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal' })
  unit_price: number;

  @Column({ type: 'decimal' })
  total_price: number;

  @ManyToOne(() => CashReceipt, (cash_receipt) => cash_receipt.items)
  cash_receipt: CashReceipt;

  @ManyToOne(() => Menu)
  menu: Menu;
}
