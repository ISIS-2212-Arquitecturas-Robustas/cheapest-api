import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('processed_calls')
export class ProcessedCall {
  @PrimaryColumn('uuid')
  idempotencyKey: string; // = OutboxHttpCall.id de Ventas

  @Column('uuid')
  ventaId: string;

  @CreateDateColumn()
  processedAt: Date;
}
