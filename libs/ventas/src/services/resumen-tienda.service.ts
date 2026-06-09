import { Injectable, Logger } from '@nestjs/common';
import { DynamoService } from '../../../shared/dynamo/src';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

export interface ResumenTiendaDto {
  tiendaId: string;
  ventasMes: number;
  totalVentasMes: number;
  ultimasVentas: { ventaId: string; fechaHora: string; total: number }[];
  ultimaActualizacion: string;
}

@Injectable()
export class ResumenTiendaService {
  private readonly logger = new Logger(ResumenTiendaService.name);
  private readonly tableName =
    process.env.DYNAMO_TABLE_RESUMEN ?? 'chiper-resumen-tienda';

  constructor(private readonly dynamoService: DynamoService) {}

  // TODO (estudiante — Tarea 3.3): implementar getResumen
  // Debe hacer un GetItem en DynamoDB con PK=tiendaId, SK='RESUMEN'.
  // Si no existe el documento, retornar null.
  async getResumen(tiendaId: string): Promise<ResumenTiendaDto | null> {
    try {
      const result = await this.dynamoService.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { tiendaId, sk: 'RESUMEN' },
        }),
      );
      return result.Item ? (result.Item as ResumenTiendaDto) : null;
    } catch (err) {
      this.logger.error(`DynamoDB GetItem failed: ${String(err)}`);
      return null;
    }
  }
}
