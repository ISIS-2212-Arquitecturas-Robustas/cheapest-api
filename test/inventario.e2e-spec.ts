import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../apps/inventario/src/app.module';
import {
  ItemInventario,
  RegistroCompraProductoTienda,
  RegistroVentaProductoTienda,
} from '../libs/inventario/src/repositories/entities';
import { LogisticaProductosClient } from '../libs/shared/logistica-client/src';
import { resetDatabase } from './support/test-database';

describe('Inventario (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    await resetDatabase([
      ItemInventario,
      RegistroCompraProductoTienda,
      RegistroVentaProductoTienda,
    ]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LogisticaProductosClient)
      .useValue({
        exists: jest.fn(
          async (id: string) => id === 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        ),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates an inventory item after product validation', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/inventory/items')
      .send({
        productoId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        tiendaId: '9a2f2e7b-40c4-4c5f-a37c-baf722e18ab9',
        cantidad: 10,
        precioVenta: 100.5,
        monedaId: '550e8400-e29b-41d4-a716-446655440000',
      })
      .expect(201);

    expect(createResponse.body.productoId).toBe(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );

    const listResponse = await request(app.getHttpServer())
      .get('/inventory/items')
      .expect(200);
    expect(listResponse.body).toHaveLength(1);

    const disponibilidadResponse = await request(app.getHttpServer())
      .get(
        '/inventory/items/disponibilidad/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      )
      .expect(200);

    expect(disponibilidadResponse.body).toEqual({
      productoId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      disponible: true,
      faulting: false,
    });
  });
});
