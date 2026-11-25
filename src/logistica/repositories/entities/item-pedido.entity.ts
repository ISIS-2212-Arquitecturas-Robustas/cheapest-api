import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from './producto.entity';

@Entity('items_pedido')
@Index('idx_items_pedido_pedido', ['pedidoId'])
@Index('idx_items_pedido_producto_pedido', ['productoId', 'pedidoId'])
export class ItemPedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  pedidoId: string;

  @Column('uuid')
  productoId: string;

  @Column('int')
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioUnitario: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  descuento: number;

  @Column('uuid')
  monedaId: string;

  @Column('varchar', { length: 100, nullable: true })
  lote: string;

  @Column('varchar', { length: 100, nullable: true })
  fechaVencimiento: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Pedido, (pedido) => pedido.items)
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @ManyToOne(() => Producto, (producto) => producto.itemsPedido)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;
}
