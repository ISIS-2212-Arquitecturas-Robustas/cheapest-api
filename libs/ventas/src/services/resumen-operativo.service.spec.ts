import { Test, TestingModule } from '@nestjs/testing';
import {
  CatalogoExterno,
  LogisticaCatalogosClient,
} from '../../../shared/logistica-client/src';
import {
  InventarioItemsClient,
  ItemInventarioExterno,
} from '../../../shared/inventario-client/src';
import { VentaService } from './venta.service';
import { ResumenOperativoService } from './resumen-operativo.service';

describe('ResumenOperativoService', () => {
  let service: ResumenOperativoService;
  let logisticaCatalogosClient: jest.Mocked<LogisticaCatalogosClient>;
  let inventarioItemsClient: jest.Mocked<InventarioItemsClient>;
  let ventaService: jest.Mocked<VentaService>;

  beforeEach(async () => {
    const mockLogisticaCatalogosClient = { getCatalogosByTienda: jest.fn() };
    const mockInventarioItemsClient = { getItemsByTienda: jest.fn() };
    const mockVentaService = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumenOperativoService,
        {
          provide: LogisticaCatalogosClient,
          useValue: mockLogisticaCatalogosClient,
        },
        { provide: InventarioItemsClient, useValue: mockInventarioItemsClient },
        { provide: VentaService, useValue: mockVentaService },
      ],
    }).compile();

    service = module.get(ResumenOperativoService);
    logisticaCatalogosClient = module.get(LogisticaCatalogosClient);
    inventarioItemsClient = module.get(InventarioItemsClient);
    ventaService = module.get(VentaService);
  });

  it('combines catalogos, inventario and ventas for the given tienda', async () => {
    const catalogos: CatalogoExterno[] = [
      {
        id: 'cat-1',
        tiendaId: 'tienda-1',
        vigenciaDesde: '2026-01-01',
        vigenciaHasta: '2026-12-31',
        zona: 'norte',
      },
    ];
    const items: ItemInventarioExterno[] = [
      {
        id: 'item-1',
        tiendaId: 'tienda-1',
        productoId: 'producto-1',
        cantidadDisponible: 5,
      },
    ];
    const ventas = [{ id: 'venta-1', tiendaId: 'tienda-1' }] as any;

    logisticaCatalogosClient.getCatalogosByTienda.mockResolvedValue(
      catalogos,
    );
    inventarioItemsClient.getItemsByTienda.mockResolvedValue(items);
    ventaService.findAll.mockResolvedValue(ventas);

    const result = await service.getResumenOperativo('tienda-1');

    expect(result).toEqual({
      tiendaId: 'tienda-1',
      catalogos,
      inventario: items,
      ventas,
    });
    expect(ventaService.findAll).toHaveBeenCalledWith({
      tiendaId: 'tienda-1',
    });
  });

  it('calls the dependent services sequentially, not in parallel', async () => {
    const callOrder: string[] = [];

    logisticaCatalogosClient.getCatalogosByTienda.mockImplementation(
      async () => {
        callOrder.push('logistica');
        return [];
      },
    );
    inventarioItemsClient.getItemsByTienda.mockImplementation(async () => {
      callOrder.push('inventario');
      return [];
    });
    ventaService.findAll.mockImplementation(async () => {
      callOrder.push('ventas');
      return [];
    });

    await service.getResumenOperativo('tienda-1');

    expect(callOrder).toEqual(['logistica', 'inventario', 'ventas']);
  });

  it('propagates errors from dependent services', async () => {
    logisticaCatalogosClient.getCatalogosByTienda.mockRejectedValue(
      new Error('Logistica service is unavailable'),
    );

    await expect(service.getResumenOperativo('tienda-1')).rejects.toThrow(
      'Logistica service is unavailable',
    );
    expect(inventarioItemsClient.getItemsByTienda).not.toHaveBeenCalled();
    expect(ventaService.findAll).not.toHaveBeenCalled();
  });
});
