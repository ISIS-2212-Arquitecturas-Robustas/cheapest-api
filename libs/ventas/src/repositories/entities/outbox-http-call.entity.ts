import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type OutboxHttpCallStatus = 'PENDING' | 'DELIVERED' | 'FAILED';

@Entity('outbox_http_calls')
export class OutboxHttpCall {
  @PrimaryGeneratedColumn('uuid')
  id: string; // también sirve como X-Idempotency-Key en la llamada a Inventario

  @Column('jsonb')
  payload: Record<string, unknown>;

  @Column('varchar', { length: 20, default: 'PENDING' })
  status: OutboxHttpCallStatus;

  @Column('int', { default: 0 })
  attempts: number;

  @Column('timestamp', { nullable: true, default: null })
  deliveredAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
