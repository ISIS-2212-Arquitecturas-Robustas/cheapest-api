import { Module } from '@nestjs/common';
import { EventBridgeService } from '../../shared/eventbridge/src';
import { DynamoService } from '../../shared/dynamo/src';
import { OutboxPublisherService } from '../../shared/outbox/src';

// Repositories (Data Layer)
import { ProductoExternoRepository, VentaRepository } from './repositories';

// Services
import { ProductoExternoService, VentaService } from './services';
import { ResumenService } from './services/resumen.service';
import { ResumenTiendaService } from './services/resumen-tienda.service';
import { ResumenTiendaSyncService } from './services/resumen-tienda-sync.service';

// Controllers
import {
  ProductoExternoController,
  ResumenTiendaController,
  ResumenTiendaSyncController,
  VentaController,
} from './controllers';
import { ResumenController } from './controllers/resumen.controller';

// Clients
import { TiendaClientMock } from './clients';
import { InventarioItemsClient } from './clients/inventario.client';
import { repositoryProviders } from './repositories/repository.providers';
import { LogisticaProductosClient } from '../../shared/logistica-client/src';

@Module({
  controllers: [
    ProductoExternoController,
    VentaController,
    ResumenController,
    ResumenTiendaController,
    ResumenTiendaSyncController,
  ],
  providers: [
    // Repositories
    ...repositoryProviders,
    ProductoExternoRepository,
    VentaRepository,
    // Services
    ProductoExternoService,
    VentaService,
    ResumenService,
    ResumenTiendaService,
    ResumenTiendaSyncService,
    // Clients
    TiendaClientMock,
    LogisticaProductosClient,
    InventarioItemsClient,
    // EDA
    EventBridgeService,
    DynamoService,
    OutboxPublisherService,
  ],
  exports: [VentaService],
})
export class VentasModule {}
