import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface ItemInventarioExterno {
  id: string;
  tiendaId: string;
  productoId: string;
  cantidadDisponible: number;
}

@Injectable()
export class InventarioItemsClient {
  private readonly baseUrl =
    process.env.INVENTARIO_BASE_URL || 'http://localhost:3002';
  private readonly timeoutMs = parseInt(
    process.env.INVENTARIO_TIMEOUT_MS || '3000',
    10,
  );

  async getItemsByTienda(tiendaId: string): Promise<ItemInventarioExterno[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `${this.baseUrl}/inventory/items?tiendaId=${tiendaId}`,
        {
          method: 'GET',
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new ServiceUnavailableException(
          'Inventario service is unavailable',
        );
      }

      return (await response.json()) as ItemInventarioExterno[];
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Inventario service is unavailable',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
