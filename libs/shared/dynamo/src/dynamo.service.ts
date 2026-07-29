import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoService {
  readonly client: DynamoDBDocumentClient;

  constructor() {
    // Credenciales explícitas solo para LocalStack (docker-compose local, sin
    // AWS_ACCESS_KEY_ID real). En AWS (ECS), NO se debe fijar `credentials`:
    // el SDK debe resolverlas con su cadena por defecto (rol de la tarea vía
    // el endpoint de metadatos de ECS). Fijar credenciales 'test'/'test' aquí
    // rompe la autenticación real y produce UnrecognizedClientException.
    const raw = new DynamoDBClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT_URL,
      ...(process.env.AWS_ACCESS_KEY_ID
        ? {
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'test',
            },
          }
        : {}),
    });
    this.client = DynamoDBDocumentClient.from(raw);
  }
}
