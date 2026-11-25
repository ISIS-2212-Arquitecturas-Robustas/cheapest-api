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
import { Producto } from './producto.entity';

@Entity('promociones')
@Index('idx_promociones_producto_vigencia', ['productoId', 'inicio', 'fin'])
export class Promocion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  nombre: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precioPromocional: number;

  @Column('uuid')
  monedaId: string;

  @Column('uuid')
  productoId: string;

  @Column('json')
  tiendaIds: string[];

  @Column('timestamp')
  inicio: Date;

  @Column('timestamp')
  fin: Date;

  @Column('int')
  restricciones: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Producto, (producto) => producto.promociones)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;
}
