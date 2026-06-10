import { Module } from '@nestjs/common';
import { LogisticaModule } from '../../../libs/logistica/src';
import {
  Catalogo,
  Despacho,
  DisponibilidadZona,
  EventoPedido,
  ItemPedido,
  NotaCredito,
  Pedido,
  Producto,
  Promocion,
} from '../../../libs/logistica/src/repositories/entities';
import { DatabaseModule } from '../../../libs/shared/database/src';
import { HealthController } from './health.controller';

const LOGISTICA_ENTITIES = [
  Catalogo,
  Despacho,
  DisponibilidadZona,
  EventoPedido,
  ItemPedido,
  NotaCredito,
  Pedido,
  Producto,
  Promocion,
];

@Module({
  imports: [DatabaseModule.forRoot(LOGISTICA_ENTITIES), LogisticaModule],
  controllers: [HealthController],
})
export class AppModule {}
