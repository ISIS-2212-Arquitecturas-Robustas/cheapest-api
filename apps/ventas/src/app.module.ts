import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../libs/shared/database/src';
import { VentasModule } from '../../../libs/ventas/src';
import {
  ItemVenta,
  ProductoExterno,
  Venta,
} from '../../../libs/ventas/src/repositories/entities';
import { OutboxEntry } from '../../../libs/shared/outbox/src';
import { HealthController } from './health.controller';

const VENTAS_ENTITIES = [ItemVenta, ProductoExterno, Venta, OutboxEntry];

@Module({
  imports: [DatabaseModule.forRoot(VENTAS_ENTITIES), VentasModule],
  controllers: [HealthController],
})
export class AppModule {}
