import { Module } from '@nestjs/common';
import { EventBridgeService } from '../../shared/eventbridge/src';
import { OutboxPublisherService } from '../../shared/outbox/src';

// Clients
import { TiendaClientMock } from './clients';

// Repositories
import {
  CatalogoProductoRepository,
  CatalogoRepository,
  DespachoRepository,
  DisponibilidadZonaRepository,
  EventoPedidoRepository,
  NotaCreditoRepository,
  PedidoRepository,
  ProductoRepository,
  PromocionRepository,
} from './repositories';

// Services
import {
  CatalogoProductoService,
  CatalogoService,
  DespachoService,
  DisponibilidadZonaService,
  NotaCreditoService,
  PedidoService,
  ProductoService,
  PromocionService,
  TenderoService,
} from './services';

// Controllers
import {
  CatalogoController,
  CatalogoProductoController,
  DespachoController,
  DisponibilidadZonaController,
  NotaCreditoController,
  PedidoController,
  ProductoController,
  PromocionController,
  TenderoController,
} from './controllers';

import { repositoryProviders } from './repositories/repository.providers';

@Module({
  controllers: [
    CatalogoController,
    ProductoController,
    PromocionController,
    PedidoController,
    DespachoController,
    NotaCreditoController,
    DisponibilidadZonaController,
    CatalogoProductoController,
    TenderoController,
  ],
  providers: [
    // Repository Providers
    ...repositoryProviders,
    // Clients
    TiendaClientMock,
    // Repositories
    CatalogoRepository,
    ProductoRepository,
    PromocionRepository,
    PedidoRepository,
    DespachoRepository,
    NotaCreditoRepository,
    DisponibilidadZonaRepository,
    CatalogoProductoRepository,
    EventoPedidoRepository,
    // Services
    CatalogoService,
    ProductoService,
    PromocionService,
    PedidoService,
    DespachoService,
    NotaCreditoService,
    DisponibilidadZonaService,
    CatalogoProductoService,
    TenderoService,
    // EDA
    EventBridgeService,
    OutboxPublisherService,
  ],
  exports: [
    CatalogoService,
    ProductoService,
    PromocionService,
    PedidoService,
    DespachoService,
    NotaCreditoService,
    DisponibilidadZonaService,
    CatalogoProductoService,
    TenderoService,
  ],
})
export class LogisticaModule {}
