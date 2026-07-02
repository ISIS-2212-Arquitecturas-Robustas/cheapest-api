import { Module } from '@nestjs/common';

// Repositories (Data Layer)
import { ProductoExternoRepository, VentaRepository } from './repositories';

// Services
import {
  ProductoExternoService,
  VentaService,
  ResumenOperativoService,
} from './services';

// Controllers
import {
  ProductoExternoController,
  VentaController,
  ResumenOperativoController,
} from './controllers';

// Clients Mock
import { TiendaClientMock } from './clients';
import { repositoryProviders } from './repositories/repository.providers';
import { LogisticaProductosClient, LogisticaCatalogosClient } from '../../shared/logistica-client/src';
import { InventarioItemsClient } from '../../shared/inventario-client/src';

@Module({
  controllers: [
    ProductoExternoController,
    VentaController,
    ResumenOperativoController,
  ],
  providers: [
    // Repositories
    ...repositoryProviders,
    ProductoExternoRepository,
    VentaRepository,
    // Services
    ProductoExternoService,
    VentaService,
    ResumenOperativoService,
    // Mock Clients
    TiendaClientMock,
    LogisticaProductosClient,
    LogisticaCatalogosClient,
    InventarioItemsClient,
  ],
  exports: [VentaService],
})
export class VentasModule {}
