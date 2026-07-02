import { ServiceUnavailableException } from '@nestjs/common';
import { InventarioItemsClient } from './inventario-items.client';

describe('InventarioItemsClient', () => {
  const originalBaseUrl = process.env.INVENTARIO_BASE_URL;
  const originalTimeout = process.env.INVENTARIO_TIMEOUT_MS;
  const originalFetch = global.fetch;

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.INVENTARIO_BASE_URL;
    } else {
      process.env.INVENTARIO_BASE_URL = originalBaseUrl;
    }

    if (originalTimeout === undefined) {
      delete process.env.INVENTARIO_TIMEOUT_MS;
    } else {
      process.env.INVENTARIO_TIMEOUT_MS = originalTimeout;
    }

    global.fetch = originalFetch;
  });

  it('returns the items list when inventario responds with 200', async () => {
    const items = [
      {
        id: 'item-1',
        tiendaId: 'tienda-1',
        productoId: 'producto-1',
        cantidadDisponible: 10,
      },
    ];
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(items), { status: 200 }),
      );

    process.env.INVENTARIO_BASE_URL = 'http://inventario.test';
    const client = new InventarioItemsClient();

    await expect(client.getItemsByTienda('tienda-1')).resolves.toEqual(
      items,
    );
  });

  it('throws ServiceUnavailableException on 5xx responses', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 503 }));

    process.env.INVENTARIO_BASE_URL = 'http://inventario.test';
    const client = new InventarioItemsClient();

    await expect(client.getItemsByTienda('tienda-1')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('throws ServiceUnavailableException on timeout/network errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network timeout'));

    process.env.INVENTARIO_BASE_URL = 'http://inventario.test';
    process.env.INVENTARIO_TIMEOUT_MS = '25';
    const client = new InventarioItemsClient();

    await expect(client.getItemsByTienda('tienda-1')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
