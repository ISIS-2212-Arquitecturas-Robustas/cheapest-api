import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class InventarioItemsClient {
  private readonly baseUrl =
    process.env.INVENTARIO_BASE_URL || 'http://localhost:3002';
  private readonly timeoutMs = parseInt(
    process.env.INVENTARIO_TIMEOUT_MS || '8000',
    10,
  );

  async findAll(): Promise<unknown[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/inventory/items`, {
        method: 'GET',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ServiceUnavailableException(
          'Inventario service is unavailable',
        );
      }

      return (await response.json()) as unknown[];
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      throw new ServiceUnavailableException('Inventario service is unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }
}
