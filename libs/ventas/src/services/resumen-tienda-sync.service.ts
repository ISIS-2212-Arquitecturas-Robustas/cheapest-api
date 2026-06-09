import { Injectable } from '@nestjs/common';
import { LogisticaProductosClient } from '../../../shared/logistica-client/src';
import { InventarioItemsClient } from '../clients/inventario.client';
import { VentaRepository } from '../repositories/venta.repository';

export interface ResumenTiendaSyncDto {
  tiendaId: string;
  ventasMes: number;
  totalVentasMes: number;
  ultimasVentas: { ventaId: string; fechaHora: string; total: number }[];
  pedidosMes: number;
  stockItems: unknown[];
  meta: {
    ventasMs: number;
    logisticaMs: number;
    inventarioMs: number;
    totalMs: number;
  };
}

@Injectable()
export class ResumenTiendaSyncService {
  constructor(
    private readonly logisticaClient: LogisticaProductosClient,
    private readonly inventarioClient: InventarioItemsClient,
    private readonly ventaRepository: VentaRepository,
  ) {}

  // Computa el resumen de una tienda de forma síncrona con fan-out en tiempo de consulta.
  // Sirve como control en el experimento del Lab 8: misma pregunta, diferente arquitectura.
  async getResumen(tiendaId: string): Promise<ResumenTiendaSyncDto> {
    const inicio = Date.now();

    // Fan-out: las llamadas a Logística e Inventario se disparan en paralelo
    // (mejor caso para la arquitectura síncrona), pero la latencia total sigue
    // acotada por el servicio más lento y escala con la carga del sistema.
    const tFanout = Date.now();
    const [pedidos, stockItems] = await Promise.all([
      this.logisticaClient.getPedidosByTienda(tiendaId),
      this.inventarioClient.findAll(),
    ]);
    const fanoutMs = Date.now() - tFanout;

    // Lectura local: las ventas viven en la misma BD del servicio Ventas.
    const tVentas = Date.now();
    const now = new Date();
    const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const ventas = await this.ventaRepository.findAll({
      tiendaId,
      fechaDesde: primerDiaMes,
    });
    const ventasMs = Date.now() - tVentas;

    const ventasMes = ventas.length;
    const totalVentasMes = ventas.reduce(
      (sum, v) => sum + Number(v.total),
      0,
    );
    const ultimasVentas = ventas
      .sort(
        (a, b) =>
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
      )
      .slice(0, 10)
      .map((v) => ({
        ventaId: v.id,
        fechaHora: v.fechaHora.toISOString(),
        total: Number(v.total),
      }));

    return {
      tiendaId,
      ventasMes,
      totalVentasMes,
      ultimasVentas,
      pedidosMes: pedidos.length,
      stockItems,
      meta: {
        ventasMs,
        logisticaMs: fanoutMs,
        inventarioMs: fanoutMs,
        totalMs: Date.now() - inicio,
      },
    };
  }
}
