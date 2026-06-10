import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LogisticaProductosClient } from '../../../shared/logistica-client/src';
import { TiendaClientMock } from '../clients';
import {
  CreateRegistroVentaDto,
  QueryRegistroVentaDto,
  RegistroVentaResponseDto,
  UpdateRegistroVentaDto,
} from '../dtos';
import { ProcessedCall } from '../repositories/entities/processed-call.entity';
import { RegistroVentaProductoTienda } from '../repositories/entities/registro-venta-producto-tienda.entity';
import { ItemInventarioRepository } from '../repositories/item-inventario.repository';
import { RegistroVentaRepository } from '../repositories/registro-venta.repository';

interface CreateRegistroVentaDesdeOutboxDto {
  tiendaId: string;
  productoId: string;
  ventaId: string;
  cantidad: number;
  fechaVenta: Date;
}

@Injectable()
export class RegistroVentaService {
  constructor(
    private readonly registroRepository: RegistroVentaRepository,
    private readonly itemRepository: ItemInventarioRepository,
    private readonly productoClient: LogisticaProductosClient,
    private readonly tiendaClient: TiendaClientMock,
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
    @Inject('PROCESSED_CALL_REPOSITORY')
    private readonly processedCallRepo: Repository<ProcessedCall>,
  ) {}

  async create(dto: CreateRegistroVentaDto): Promise<RegistroVentaResponseDto> {
    // Validar que producto y tienda existan
    const productoExists = await this.productoClient.exists(dto.productoId);
    if (!productoExists) {
      throw new BadRequestException(
        `Producto con id ${dto.productoId} no existe`,
      );
    }

    const tiendaExists = await this.tiendaClient.exists(dto.tiendaId);
    if (!tiendaExists) {
      throw new BadRequestException(`Tienda con id ${dto.tiendaId} no existe`);
    }

    // Validar que el item inventario exista
    const item = await this.itemRepository.findById(dto.itemInventarioId);
    if (!item) {
      throw new BadRequestException(
        `ItemInventario con id ${dto.itemInventarioId} no encontrado`,
      );
    }

    // Validar coherencia: el item debe pertenecer al mismo producto y tienda
    if (item.productoId !== dto.productoId) {
      throw new BadRequestException(
        `El itemInventario ${dto.itemInventarioId} no pertenece al producto ${dto.productoId}`,
      );
    }

    if (item.tiendaId !== dto.tiendaId) {
      throw new BadRequestException(
        `El itemInventario ${dto.itemInventarioId} no pertenece a la tienda ${dto.tiendaId}`,
      );
    }

    // Validar que hay suficiente cantidad
    if (item.cantidad < dto.cantidad) {
      throw new BadRequestException(
        `Cantidad insuficiente en inventario. Disponible: ${item.cantidad}, Requerido: ${dto.cantidad}`,
      );
    }

    // Crear registro de venta
    const registro = await this.registroRepository.create(
      dto as Partial<RegistroVentaProductoTienda>,
    );

    // Decrementar cantidad en inventario
    await this.itemRepository.decrementCantidad(
      dto.itemInventarioId,
      dto.cantidad,
    );

    return this.mapToResponse(registro);
  }

  async findAll(
    query: QueryRegistroVentaDto,
  ): Promise<RegistroVentaResponseDto[]> {
    const registros = await this.registroRepository.findAll(query);
    return registros.map((registro) => this.mapToResponse(registro));
  }

  async findById(id: string): Promise<RegistroVentaResponseDto> {
    const registro = await this.registroRepository.findById(id);
    if (!registro) {
      throw new NotFoundException(`RegistroVenta con id ${id} no encontrado`);
    }
    return this.mapToResponse(registro);
  }

  async update(
    id: string,
    dto: UpdateRegistroVentaDto,
  ): Promise<RegistroVentaResponseDto> {
    const registro = await this.registroRepository.findById(id);
    if (!registro) {
      throw new NotFoundException(`RegistroVenta con id ${id} no encontrado`);
    }

    const updatedRegistro = await this.registroRepository.update(
      id,
      dto as Partial<RegistroVentaProductoTienda>,
    );
    return this.mapToResponse(updatedRegistro!);
  }

  async delete(id: string): Promise<void> {
    const registro = await this.registroRepository.findById(id);
    if (!registro) {
      throw new NotFoundException(`RegistroVenta con id ${id} no encontrado`);
    }

    // Al eliminar, devolver la cantidad al inventario
    await this.itemRepository.incrementCantidad(
      registro.itemInventarioId,
      registro.cantidad,
    );

    await this.registroRepository.delete(id);
  }

  // TODO (estudiante — Tarea 3.2): revisar este método.
  // El flujo implementa idempotencia mediante la tabla processed_calls.
  // Preguntas clave:
  //   1. ¿Por qué respondemos 409 cuando la clave ya fue procesada?
  //   2. ¿Qué ocurriría si el proceso muere entre decrementCantidad() y el save de ProcessedCall?
  //   3. ¿Por qué usamos el id del OutboxHttpCall como clave y no el ventaId?
  async createDesdeOutbox(
    dto: CreateRegistroVentaDesdeOutboxDto,
    idempotencyKey: string,
  ): Promise<RegistroVentaResponseDto | { status: 'already_processed' }> {
    // Verificar idempotencia: si esta clave ya fue procesada, rechazar
    const alreadyProcessed = await this.processedCallRepo.findOne({
      where: { idempotencyKey },
    });
    if (alreadyProcessed) {
      throw new ConflictException(
        `La clave ${idempotencyKey} ya fue procesada`,
      );
    }

    // Buscar el ItemInventario por productoId + tiendaId
    const items = await this.itemRepository.findByProductoId(dto.productoId);
    const item = items.find((i) => i.tiendaId === dto.tiendaId);
    if (!item) {
      throw new BadRequestException(
        `No existe ItemInventario para productoId=${dto.productoId} y tiendaId=${dto.tiendaId}`,
      );
    }

    if (item.cantidad < dto.cantidad) {
      throw new BadRequestException(
        `Cantidad insuficiente. Disponible: ${item.cantidad}, Requerido: ${dto.cantidad}`,
      );
    }

    // Crear el registro de venta, decrementar stock y guardar ProcessedCall
    // en una sola transacción para garantizar consistencia.
    const registro = await this.dataSource.transaction(async (manager) => {
      const newRegistro = manager.create(RegistroVentaProductoTienda, {
        tiendaId: dto.tiendaId,
        productoId: dto.productoId,
        ventaId: dto.ventaId,
        itemInventarioId: item.id,
        fechaVenta: dto.fechaVenta,
        cantidad: dto.cantidad,
      });
      const saved = await manager.save(newRegistro);

      await this.itemRepository.decrementCantidad(item.id, dto.cantidad);

      await manager.save(ProcessedCall, {
        idempotencyKey,
        ventaId: dto.ventaId,
      });

      return saved;
    });

    return this.mapToResponse(registro);
  }

  private mapToResponse(
    registro: RegistroVentaProductoTienda,
  ): RegistroVentaResponseDto {
    return {
      id: registro.id,
      tiendaId: registro.tiendaId,
      productoId: registro.productoId,
      ventaId: registro.ventaId,
      itemInventarioId: registro.itemInventarioId,
      fechaVenta: registro.fechaVenta,
      cantidad: registro.cantidad,
      createdAt: registro.createdAt,
      updatedAt: registro.updatedAt,
    };
  }
}
