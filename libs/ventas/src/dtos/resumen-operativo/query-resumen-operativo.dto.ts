import { IsNotEmpty, IsUUID } from 'class-validator';

export class QueryResumenOperativoDto {
  @IsUUID()
  @IsNotEmpty()
  tiendaId: string;
}
