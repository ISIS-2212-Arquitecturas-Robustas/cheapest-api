import { Injectable, Logger } from '@nestjs/common';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { ChiperEvent } from './chiper-event.interface';

@Injectable()
export class EventBridgeService {
  private readonly logger = new Logger(EventBridgeService.name);
  private readonly client: EventBridgeClient;
  private readonly busName: string;

  constructor() {
    this.busName = process.env.EVENTBRIDGE_BUS_NAME ?? 'chiper-bus';
    this.client = new EventBridgeClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT_URL,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'test',
      },
    });
  }

  async publish(event: ChiperEvent): Promise<void> {
    try {
      await this.client.send(
        new PutEventsCommand({
          Entries: [
            {
              EventBusName: this.busName,
              Source: event.source,
              DetailType: event.detailType,
              Detail: JSON.stringify(event.detail),
              Time: new Date(),
            },
          ],
        }),
      );
      this.logger.debug(`Published ${event.detailType} from ${event.source}`);
    } catch (err) {
      // Fire-and-forget desde EventBridgeService directo (sin Outbox).
      // El Outbox pattern (OutboxPublisherService) garantiza at-least-once.
      this.logger.error(
        `EventBridge publish failed: ${String(err)}`,
      );
    }
  }
}
