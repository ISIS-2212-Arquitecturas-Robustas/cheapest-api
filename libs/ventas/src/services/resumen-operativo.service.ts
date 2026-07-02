import { Injectable } from '@nestjs/common';
import { LogisticaCatalogosClient } from '../../../shared/logistica-client/src';
import { InventarioItemsClient } from '../../../shared/inventario-client/src';
import { ResumenOperativoResponseDto } from '../dtos';
import { VentaService } from './venta.service';

@Injectable()
export class ResumenOperativoService {
  constructor(
    private readonly logisticaCatalogosClient: LogisticaCatalogosClient,
    private readonly inventarioItemsClient: InventarioItemsClient,
    private readonly ventaService: VentaService,
  ) {}

  // Orquestacion sincrona: cada llamada espera a que la anterior termine antes de iniciar
  // la siguiente. Esto es intencional (ver lab_7): la latencia total es la SUMA de las
  // latencias individuales, no el maximo, lo que produce el efecto de latencia compuesta
  // que este laboratorio busca evidenciar. No usar Promise.all aqui.
  async getResumenOperativo(
    tiendaId: string,
  ): Promise<ResumenOperativoResponseDto> {
    const catalogos =
      await this.logisticaCatalogosClient.getCatalogosByTienda(tiendaId);

    const inventario =
      await this.inventarioItemsClient.getItemsByTienda(tiendaId);

    const ventas = await this.ventaService.findAll({ tiendaId });

    return {
      tiendaId,
      catalogos,
      inventario,
      ventas,
    };
  }
}
