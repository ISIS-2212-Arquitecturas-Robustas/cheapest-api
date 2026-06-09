import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { DataSource, Repository } from 'typeorm';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoService } from '../../../shared/dynamo/src';
import { ProcessedEvent } from '../repositories/entities/processed-event.entity';

interface VentaCreadaPayload {
  ventaId: string;
  tiendaId: string;
  total: number;
  monedaId: string;
  fechaHora: string;
  outboxId: string;
}

@Injectable()
export class VentaCreadaConsumer implements OnModuleInit {
  private readonly logger = new Logger(VentaCreadaConsumer.name);
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly tableName: string;

  constructor(
    private readonly dynamoService: DynamoService,
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
    @Inject('PROCESSED_EVENT_REPOSITORY')
    private readonly processedEventRepo: Repository<ProcessedEvent>,
  ) {
    this.queueUrl = process.env.SQS_VENTA_CREADA_URL ?? '';
    this.tableName =
      process.env.DYNAMO_TABLE_RESUMEN ?? 'chiper-resumen-tienda';
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT_URL,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'test',
      },
    });
  }

  onModuleInit() {
    if (!this.queueUrl) {
      this.logger.warn(
        'SQS_VENTA_CREADA_URL no configurada — consumer desactivado',
      );
      return;
    }
    setInterval(() => {
      this.poll().catch((err) =>
        this.logger.error(`SQS poll error: ${String(err)}`),
      );
    }, 2000);
  }

  private async poll(): Promise<void> {
    const response = await this.sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 2,
      }),
    );

    for (const message of response.Messages ?? []) {
      try {
        await this.processMessage(message.Body ?? '{}', message.ReceiptHandle!);
      } catch (err) {
        this.logger.error(`Error processing message: ${String(err)}`);
      }
    }
  }

  // TODO (estudiante — Tarea 3.2): revisar y completar processMessage.
  // El esqueleto ya implementa el flujo completo. Asegúrate de entender:
  //   1. Por qué usamos outboxId como eventId para la idempotencia
  //   2. Por qué el registro de ProcessedEvent va en una transacción PG separada de DynamoDB
  //   3. Qué ocurre si el proceso falla entre updateResumenTienda() y el save de ProcessedEvent
  private async processMessage(
    body: string,
    receiptHandle: string,
  ): Promise<void> {
    const envelope = JSON.parse(body) as { detail: VentaCreadaPayload };
    const payload = envelope.detail;
    const eventId = payload.outboxId;

    // Verificar idempotencia
    const alreadyProcessed = await this.processedEventRepo.findOne({
      where: { eventId },
    });
    if (alreadyProcessed) {
      this.logger.debug(`Evento ${eventId} ya procesado — skip`);
      await this.deleteMessage(receiptHandle);
      return;
    }

    // Actualizar read model en DynamoDB
    await this.updateResumenTienda(payload);

    // Registrar como procesado en PostgreSQL
    await this.dataSource.transaction(async (manager) => {
      await manager.save(ProcessedEvent, {
        eventId,
        eventType: 'VentaCreada',
      });
    });

    await this.deleteMessage(receiptHandle);
    this.logger.debug(
      `Procesado VentaCreada ${payload.ventaId} para tienda ${payload.tiendaId}`,
    );
  }

  // TODO (estudiante — Tarea 3.1): revisar el UpdateCommand de DynamoDB.
  // Verifica que los ExpressionAttributeValues sean correctos para:
  //   - Incrementar ventasMes y totalVentasMes (ADD)
  //   - Agregar la venta a ultimasVentas (list_append)
  //   - Actualizar ultimaActualizacion
  private async updateResumenTienda(
    payload: VentaCreadaPayload,
  ): Promise<void> {
    await this.dynamoService.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { tiendaId: payload.tiendaId, sk: 'RESUMEN' },
        UpdateExpression: `
          ADD ventasMes :uno, totalVentasMes :total
          SET ultimaActualizacion = :ts,
              ultimasVentas = list_append(
                if_not_exists(ultimasVentas, :emptyList),
                :nuevaVenta
              )
        `,
        ExpressionAttributeValues: {
          ':uno': 1,
          ':total': Number(payload.total),
          ':ts': new Date().toISOString(),
          ':emptyList': [],
          ':nuevaVenta': [
            {
              ventaId: payload.ventaId,
              fechaHora: payload.fechaHora,
              total: Number(payload.total),
            },
          ],
        },
      }),
    );
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    await this.sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
  }
}
