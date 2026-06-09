import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEvent {
  @PrimaryColumn('uuid')
  eventId: string;

  @Column('varchar', { length: 100 })
  eventType: string;

  @CreateDateColumn()
  processedAt: Date;
}
