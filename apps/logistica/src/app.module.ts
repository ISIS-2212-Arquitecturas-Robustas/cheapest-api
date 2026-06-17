import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoAuthModule } from '../../../libs/shared/auth/src';
import { LogisticaModule } from '../../../libs/logistica/src';
import {
  Catalogo,
  Despacho,
  DisponibilidadZona,
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
  ItemPedido,
  NotaCredito,
  Pedido,
  Producto,
  Promocion,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CognitoAuthModule,
    DatabaseModule.forRoot(LOGISTICA_ENTITIES),
    LogisticaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
