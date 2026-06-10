import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { IsDate, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateRegistroVentaDto,
  QueryRegistroVentaDto,
  RegistroVentaResponseDto,
  UpdateRegistroVentaDto,
} from '../dtos';
import { RegistroVentaService } from '../services/registro-venta.service';

class CreateRegistroVentaDesdeOutboxDto {
  @IsUUID()
  tiendaId!: string;

  @IsUUID()
  productoId!: string;

  @IsUUID()
  ventaId!: string;

  @IsNumber()
  @IsPositive()
  cantidad!: number;

  @IsDate()
  @Type(() => Date)
  fechaVenta!: Date;
}

@Controller('inventory/ventas')
export class RegistroVentaController {
  constructor(private readonly registroService: RegistroVentaService) {}

  @Post()
  async create(
    @Body(new ValidationPipe({ transform: true }))
    dto: CreateRegistroVentaDto,
  ): Promise<RegistroVentaResponseDto> {
    return this.registroService.create(dto);
  }

  // Endpoint consumido por el OutboxHttpPublisherService de Ventas.
  // Acepta X-Idempotency-Key para evitar decrementos duplicados ante reintentos.
  // TODO (estudiante — Tarea 3.2): revisar este endpoint e identificar:
  //   1. ¿Qué ocurre si se recibe la misma X-Idempotency-Key dos veces?
  //   2. ¿Por qué se responde 409 en lugar de 200 en el caso duplicado?
  @Post('desde-outbox')
  async createDesdeOutbox(
    @Headers('x-idempotency-key') idempotencyKey: string | undefined,
    @Body(new ValidationPipe({ transform: true }))
    dto: CreateRegistroVentaDesdeOutboxDto,
  ): Promise<RegistroVentaResponseDto | { status: 'already_processed' }> {
    if (!idempotencyKey) {
      throw new ConflictException('Falta el header X-Idempotency-Key');
    }
    return this.registroService.createDesdeOutbox(dto, idempotencyKey);
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryRegistroVentaDto,
  ): Promise<RegistroVentaResponseDto[]> {
    return this.registroService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<RegistroVentaResponseDto> {
    return this.registroService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true }))
    dto: UpdateRegistroVentaDto,
  ): Promise<RegistroVentaResponseDto> {
    return this.registroService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.registroService.delete(id);
  }
}
