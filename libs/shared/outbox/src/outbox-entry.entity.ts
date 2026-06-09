import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('outbox')
export class OutboxEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  eventSource: string;

  @Column('varchar', { length: 100 })
  eventType: string;

  @Column('uuid')
  aggregateId: string;

  @Column('jsonb')
  payload: Record<string, unknown>;

  @Column('timestamp', { nullable: true, default: null })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
