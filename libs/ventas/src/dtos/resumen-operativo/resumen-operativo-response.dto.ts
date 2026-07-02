import { CatalogoExterno } from '../../../../shared/logistica-client/src';
import { ItemInventarioExterno } from '../../../../shared/inventario-client/src';
import { VentaResponseDto } from '../venta';

export class ResumenOperativoResponseDto {
  tiendaId: string;
  catalogos: CatalogoExterno[];
  inventario: ItemInventarioExterno[];
  ventas: VentaResponseDto[];
}
