import { ServiceUnavailableException } from '@nestjs/common';
import { LogisticaCatalogosClient } from './logistica-catalogos.client';

describe('LogisticaCatalogosClient', () => {
  const originalBaseUrl = process.env.LOGISTICA_BASE_URL;
  const originalTimeout = process.env.LOGISTICA_TIMEOUT_MS;
  const originalFetch = global.fetch;

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.LOGISTICA_BASE_URL;
    } else {
      process.env.LOGISTICA_BASE_URL = originalBaseUrl;
    }

    if (originalTimeout === undefined) {
      delete process.env.LOGISTICA_TIMEOUT_MS;
    } else {
      process.env.LOGISTICA_TIMEOUT_MS = originalTimeout;
    }

    global.fetch = originalFetch;
  });

  it('returns the catalogos list when logistica responds with 200', async () => {
    const catalogos = [{ id: 'cat-1', tiendaId: 'tienda-1', zona: 'norte' }];
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(catalogos), { status: 200 }),
      );

    process.env.LOGISTICA_BASE_URL = 'http://logistica.test';
    const client = new LogisticaCatalogosClient();

    await expect(client.getCatalogosByTienda('tienda-1')).resolves.toEqual(
      catalogos,
    );
  });

  it('throws ServiceUnavailableException on 5xx responses', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 503 }));

    process.env.LOGISTICA_BASE_URL = 'http://logistica.test';
    const client = new LogisticaCatalogosClient();

    await expect(client.getCatalogosByTienda('tienda-1')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('throws ServiceUnavailableException on timeout/network errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network timeout'));

    process.env.LOGISTICA_BASE_URL = 'http://logistica.test';
    process.env.LOGISTICA_TIMEOUT_MS = '25';
    const client = new LogisticaCatalogosClient();

    await expect(client.getCatalogosByTienda('tienda-1')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
