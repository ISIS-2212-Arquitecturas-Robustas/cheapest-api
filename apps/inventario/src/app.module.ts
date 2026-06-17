import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoAuthModule } from '../../../libs/shared/auth/src';
import { InventarioModule } from '../../../libs/inventario/src';
import {
  ItemInventario,
  RegistroCompraProductoTienda,
  RegistroVentaProductoTienda,
} from '../../../libs/inventario/src/repositories/entities';
import { DatabaseModule } from '../../../libs/shared/database/src';
import { HealthController } from './health.controller';

const INVENTARIO_ENTITIES = [
  ItemInventario,
  RegistroCompraProductoTienda,
  RegistroVentaProductoTienda,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CognitoAuthModule,
    DatabaseModule.forRoot(INVENTARIO_ENTITIES),
    InventarioModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
