import { Injectable } from '@nestjs/common';
import { LogisticaProductosClient } from '../../../shared/logistica-client/src';
import { InventarioItemsClient } from '../clients/inventario.client';
import { VentaRepository } from '../repositories/venta.repository';

export interface ResumenOperativoDto {
  catalogos: unknown[];
  inventario: unknown[];
  ventas: unknown[];
  meta: {
    catalogosMs: number;
    inventarioMs: number;
    ventasMs: number;
    totalMs: number;
  };
}

@Injectable()
export class ResumenService {
  constructor(
    private readonly logisticaClient: LogisticaProductosClient,
    private readonly inventarioClient: InventarioItemsClient,
    private readonly ventaRepository: VentaRepository,
  ) {}

  async getResumenOperativo(): Promise<ResumenOperativoDto> {
    const inicio = Date.now();

    // Llamada 1 (síncrona): catálogos de Logística
    const t0 = Date.now();
    const catalogos = await this.logisticaClient.findCatalogos();
    const catalogosMs = Date.now() - t0;

    // Llamada 2 (síncrona): ítems de Inventario
    const t1 = Date.now();
    const inventario = await this.inventarioClient.findAll();
    const inventarioMs = Date.now() - t1;

    // Llamada 3: consulta local de Ventas (misma BD del servicio)
    const t2 = Date.now();
    const ventas = await this.ventaRepository.findAll({});
    const ventasMs = Date.now() - t2;

    const totalMs = Date.now() - inicio;

    return {
      catalogos,
      inventario,
      ventas,
      meta: { catalogosMs, inventarioMs, ventasMs, totalMs },
    };
  }
}
