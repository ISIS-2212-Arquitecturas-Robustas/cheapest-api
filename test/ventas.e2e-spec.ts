import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../apps/ventas/src/app.module';
import { InventarioDisponibilidadClient } from '../libs/shared/inventario-client/src';
import { LogisticaProductosClient } from '../libs/shared/logistica-client/src';
import {
  ItemVenta,
  ProductoExterno,
  Venta,
} from '../libs/ventas/src/repositories/entities';
import { resetDatabase } from './support/test-database';

describe('Ventas (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    await resetDatabase([ItemVenta, ProductoExterno, Venta]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LogisticaProductosClient)
      .useValue({
        exists: jest.fn(
          async (id: string) => id === 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        ),
      })
      .overrideProvider(InventarioDisponibilidadClient)
      .useValue({
        isDisponible: jest.fn(
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

  it('creates a sale after validating the catalog product', async () => {
    const productoExternoResponse = await request(app.getHttpServer())
      .post('/ventas/productos-externos')
      .send({
        tiendaId: '9a2f2e7b-40c4-4c5f-a37c-baf722e18ab9',
        codigoBarras: '7501234567890',
        nombre: 'Coca Cola 2L Test',
        categoria: 'Bebidas',
        precioBase: 25.5,
        monedaId: '550e8400-e29b-41d4-a716-446655440000',
        cantidad: 100,
      })
      .expect(201);

    const ventaResponse = await request(app.getHttpServer())
      .post('/ventas/ventas')
      .send({
        tiendaId: '9a2f2e7b-40c4-4c5f-a37c-baf722e18ab9',
        fechaHora: '2026-02-09T10:30:00.000Z',
        monedaId: '550e8400-e29b-41d4-a716-446655440000',
        items: [
          {
            productoExternoId: productoExternoResponse.body.id,
            productoId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            cantidad: 2,
            precioUnitario: 26,
          },
        ],
      })
      .expect(201);

    expect(ventaResponse.body.total).toBe(52);

    const getResponse = await request(app.getHttpServer())
      .get(`/ventas/ventas/${ventaResponse.body.id as string}`)
      .expect(200);
    expect(getResponse.body.items[0].productoId).toBe(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
  });
});
