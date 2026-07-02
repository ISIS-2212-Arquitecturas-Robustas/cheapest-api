import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface CatalogoExterno {
  id: string;
  tiendaId: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  zona: string;
}

@Injectable()
export class LogisticaCatalogosClient {
  private readonly baseUrl =
    process.env.LOGISTICA_BASE_URL || 'http://localhost:3001';
  private readonly timeoutMs = parseInt(
    process.env.LOGISTICA_TIMEOUT_MS || '3000',
    10,
  );

  async getCatalogosByTienda(tiendaId: string): Promise<CatalogoExterno[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `${this.baseUrl}/logistics/catalogos?tiendaId=${tiendaId}`,
        {
          method: 'GET',
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new ServiceUnavailableException(
          'Logistica service is unavailable',
        );
      }

      return (await response.json()) as CatalogoExterno[];
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Logistica service is unavailable',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
