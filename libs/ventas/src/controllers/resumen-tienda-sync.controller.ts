import { Controller, Get, Param } from '@nestjs/common';
import { ResumenTiendaSyncService } from '../services/resumen-tienda-sync.service';

@Controller('ventas')
export class ResumenTiendaSyncController {
  constructor(
    private readonly resumenTiendaSyncService: ResumenTiendaSyncService,
  ) {}

  // Endpoint CONTROL del experimento Lab 8: computa el resumen-tienda de forma
  // síncrona con fan-out a Logística + Inventario en tiempo de consulta.
  // Comparar el p99 de este endpoint vs GET /ventas/resumen-tienda/:tiendaId (EDA)
  // revela el costo del fan-out síncrono y la ventaja del read model pre-computado.
  @Get('resumen-tienda-sync/:tiendaId')
  async getResumenTienda(@Param('tiendaId') tiendaId: string) {
    return this.resumenTiendaSyncService.getResumen(tiendaId);
  }
}
