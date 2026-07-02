import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import {
  QueryResumenOperativoDto,
  ResumenOperativoResponseDto,
} from '../dtos';
import { ResumenOperativoService } from '../services';

// Montado en 'ventas' (no 'ventas/ventas') a proposito: la ruta real debe quedar en
// ventas/resumen-operativo para coincidir con la ruta que el estudiante invoca a traves de
// API Gateway (ver lab_7, seccion 4.4).
@Controller('ventas')
export class ResumenOperativoController {
  constructor(
    private readonly resumenOperativoService: ResumenOperativoService,
  ) {}

  @Get('resumen-operativo')
  async getResumenOperativo(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryResumenOperativoDto,
  ): Promise<ResumenOperativoResponseDto> {
    return this.resumenOperativoService.getResumenOperativo(query.tiendaId);
  }
}
