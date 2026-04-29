import { Injectable, ServiceUnavailableException } from '@nestjs/common';

interface InventarioDisponibilidadResponse {
  productoId: string;
  disponible: boolean;
  faulting: boolean;
}

@Injectable()
export class InventarioDisponibilidadClient {
  private readonly baseUrl =
    process.env.INVENTARIO_BASE_URL || 'http://localhost:3002';
  private readonly timeoutMs = parseInt(
    process.env.INVENTARIO_TIMEOUT_MS || '3000',
    10,
  );

  async isDisponible(productoId: string): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `${this.baseUrl}/inventory/items/disponibilidad/${productoId}`,
        {
          method: 'GET',
          signal: controller.signal,
        },
      );

      if (response.status === 404) {
        return false;
      }

      if (!response.ok) {
        throw new ServiceUnavailableException(
          'Inventario service is unavailable',
        );
      }

      const payload =
        (await response.json()) as Partial<InventarioDisponibilidadResponse>;

      return payload.disponible === true;
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
