import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { EventBridgeService } from '../../eventbridge/src';
import { OutboxEntry } from './outbox-entry.entity';

@Injectable()
export class OutboxPublisherService implements OnModuleInit {
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
    private readonly eventBridgeService: EventBridgeService,
  ) {}

  onModuleInit() {
    setInterval(() => {
      this.processOutbox().catch((err) =>
        this.logger.error(`Outbox processing error: ${String(err)}`),
      );
    }, 1000);
  }

  private async processOutbox(): Promise<void> {
    const repository = this.dataSource.getRepository(OutboxEntry);

    const pending = await repository.find({
      where: { publishedAt: IsNull() },
      order: { createdAt: 'ASC' },
      take: 10,
    });

    for (const entry of pending) {
      try {
        await this.eventBridgeService.publish({
          source: entry.eventSource as 'chiper.ventas' | 'chiper.logistica',
          detailType: entry.eventType as
            | 'VentaCreada'
            | 'PedidoCreado'
            | 'PedidoCambioEstado',
          detail: { ...entry.payload, outboxId: entry.id },
        });
        await repository.update(entry.id, { publishedAt: new Date() });
      } catch (err) {
        this.logger.warn(
          `Failed to publish outbox entry ${entry.id}: ${String(err)}`,
        );
      }
    }
  }
}
