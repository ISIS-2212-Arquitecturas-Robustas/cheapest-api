import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ResumenTiendaService } from '../services/resumen-tienda.service';

@Controller('ventas')
export class ResumenTiendaController {
  constructor(private readonly resumenTiendaService: ResumenTiendaService) {}

  // Endpoint EDA — lee desde el read model pre-computado en DynamoDB.
  // Comparar p99 de este endpoint vs GET /ventas/resumen-operativo (Lab 7 síncrono)
  // es el experimento central del Lab 8.
  @Get('resumen-tienda/:tiendaId')
  async getResumenTienda(@Param('tiendaId') tiendaId: string) {
    const resumen = await this.resumenTiendaService.getResumen(tiendaId);
    if (!resumen) {
      throw new NotFoundException(
        `No existe resumen para la tienda ${tiendaId}. ` +
          'Asegúrese de que el consumer de Inventario haya procesado al menos una VentaCreada.',
      );
    }
    return resumen;
  }
}
