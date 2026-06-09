import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('eventos_pedido')
@Index(['pedidoId', 'version'])
export class EventoPedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  pedidoId: string;

  @Column('varchar', { length: 100 })
  tipo: string;

  @Column('jsonb')
  payload: Record<string, unknown>;

  @Column('int')
  version: number;

  @Column('timestamp')
  occurredAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
