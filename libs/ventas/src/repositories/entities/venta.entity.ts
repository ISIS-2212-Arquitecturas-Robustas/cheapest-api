import {
  Column,
  CreateDateColumn,
  Entity,
  EntitySchema,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemVenta } from './item-venta.entity';

@Entity('ventas')
@Index('idx_ventas_tienda_fecha', ['tiendaId', 'fechaHora'])
export class Venta extends EntitySchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tiendaId: string;

  @Column('timestamp')
  fechaHora: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('uuid')
  monedaId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ItemVenta, (itemVenta) => itemVenta.venta, {
    cascade: true,
    eager: true,
  })
  items: ItemVenta[];
}
