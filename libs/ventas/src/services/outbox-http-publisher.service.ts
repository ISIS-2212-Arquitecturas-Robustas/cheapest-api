import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OutboxHttpCall } from '../repositories/entities/outbox-http-call.entity';

const MAX_ATTEMPTS = 10;

@Injectable()
export class OutboxHttpPublisherService implements OnModuleInit {
  private readonly logger = new Logger(OutboxHttpPublisherService.name);
  private readonly inventarioBaseUrl =
    process.env.INVENTARIO_BASE_URL ?? 'http://localhost:3002';

  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    setInterval(() => {
      this.processPending().catch((err) =>
        this.logger.error(`Outbox HTTP error: ${String(err)}`),
      );
    }, 2000);
  }

  private async processPending(): Promise<void> {
    const repo = this.dataSource.getRepository(OutboxHttpCall);
    const pending = await repo.find({
      where: { status: 'PENDING' },
      order: { createdAt: 'ASC' },
      take: 10,
    });

    for (const call of pending) {
      try {
        const response = await fetch(
          `${this.inventarioBaseUrl}/inventory/ventas/desde-outbox`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Idempotency-Key': call.id,
            },
            body: JSON.stringify(call.payload),
            signal: AbortSignal.timeout(5000),
          },
        );

        if (response.ok || response.status === 409) {
          // 409 = ya procesado (idempotencia) — cuenta como entregado
          await repo.update(call.id, {
            status: 'DELIVERED',
            deliveredAt: new Date(),
          });
          this.logger.debug(`Outbox call ${call.id} entregado`);
        } else {
          await this.handleFailure(repo, call);
        }
      } catch {
        await this.handleFailure(repo, call);
      }
    }
  }

  private async handleFailure(
    repo: ReturnType<DataSource['getRepository']>,
    call: OutboxHttpCall,
  ): Promise<void> {
    const newAttempts = call.attempts + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      await repo.update(call.id, { status: 'FAILED', attempts: newAttempts });
      this.logger.warn(`Outbox call ${call.id} marcado como FAILED tras ${newAttempts} intentos`);
    } else {
      await repo.update(call.id, { attempts: newAttempts });
    }
  }
}
