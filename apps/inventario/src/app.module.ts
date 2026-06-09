import { Module } from '@nestjs/common';
import { InventarioModule } from '../../../libs/inventario/src';
import {
  ItemInventario,
  ProcessedEvent,
  RegistroCompraProductoTienda,
  RegistroVentaProductoTienda,
} from '../../../libs/inventario/src/repositories/entities';
import { DatabaseModule } from '../../../libs/shared/database/src';
import { HealthController } from './health.controller';

const INVENTARIO_ENTITIES = [
  ItemInventario,
  ProcessedEvent,
  RegistroCompraProductoTienda,
  RegistroVentaProductoTienda,
];

@Module({
  imports: [DatabaseModule.forRoot(INVENTARIO_ENTITIES), InventarioModule],
  controllers: [HealthController],
})
export class AppModule {}
