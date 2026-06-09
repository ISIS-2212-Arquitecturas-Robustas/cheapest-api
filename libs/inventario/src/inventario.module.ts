import { Module } from '@nestjs/common';
import { DynamoService } from '../../shared/dynamo/src';

// Repositories (Data Layer)
import {
  ItemInventarioRepository,
  RegistroCompraRepository,
  RegistroVentaRepository,
} from './repositories';

// Services
import {
  ItemInventarioService,
  RegistroCompraService,
  RegistroVentaService,
} from './services';

// Controllers
import {
  ItemInventarioController,
  RegistroCompraController,
  RegistroVentaController,
} from './controllers';

import { TiendaClientMock } from './clients';
import { repositoryProviders } from './repositories/repository.providers';
import { LogisticaProductosClient } from '../../shared/logistica-client/src';
import { VentaCreadaConsumer } from './consumers/venta-creada.consumer';

@Module({
  controllers: [
    ItemInventarioController,
    RegistroVentaController,
    RegistroCompraController,
  ],
  providers: [
    // Repositories
    ...repositoryProviders,
    ItemInventarioRepository,
    RegistroVentaRepository,
    RegistroCompraRepository,
    // Services
    ItemInventarioService,
    RegistroVentaService,
    RegistroCompraService,
    // Mock Clients
    TiendaClientMock,
    LogisticaProductosClient,
    // EDA
    DynamoService,
    VentaCreadaConsumer,
  ],
  exports: [ItemInventarioService, RegistroVentaService, RegistroCompraService],
})
export class InventarioModule {}
