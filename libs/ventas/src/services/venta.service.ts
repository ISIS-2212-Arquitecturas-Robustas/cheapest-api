import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventarioDisponibilidadClient } from '../../../shared/inventario-client/src';
import { LogisticaProductosClient } from '../../../shared/logistica-client/src';
import { TiendaClientMock } from '../clients';
import {
  CreateVentaDto,
  ItemVentaResponseDto,
  QueryVentaDto,
  UpdateVentaDto,
  VentaResponseDto,
} from '../dtos';
import { ItemVenta } from '../repositories/entities/item-venta.entity';
import { OutboxHttpCall } from '../repositories/entities/outbox-http-call.entity';
import { Venta } from '../repositories/entities/venta.entity';
import { ProductoExternoRepository } from '../repositories/producto-externo.repository';
import { VentaRepository } from '../repositories/venta.repository';

export interface PendingStockConfirmationDto {
  status: 'pending_stock_confirmation';
  message: string;
  [key: string]: unknown;
}

@Injectable()
export class VentaService {
  constructor(
    private readonly ventaRepository: VentaRepository,
    private readonly productoExternoRepository: ProductoExternoRepository,
    private readonly tiendaClient: TiendaClientMock,
    private readonly productoClient: LogisticaProductosClient,
    private readonly inventarioClient: InventarioDisponibilidadClient,
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateVentaDto): Promise<VentaResponseDto | PendingStockConfirmationDto> {
    // Validar que la tienda exista
    const tiendaExists = await this.tiendaClient.exists(dto.tiendaId);
    if (!tiendaExists) {
      throw new BadRequestException(`Tienda con id ${dto.tiendaId} no existe`);
    }

    // Validar que todos los productos externos existan
    for (const item of dto.items) {
      const productoExists = await this.productoExternoRepository.findById(
        item.productoExternoId,
      );
      if (!productoExists) {
        throw new BadRequestException(
          `ProductoExterno con id ${item.productoExternoId} no existe`,
        );
      }

      if (item.productoId) {
        const productoExiste = await this.productoClient.exists(item.productoId);
        if (!productoExiste) {
          throw new BadRequestException(
            `Producto con id ${item.productoId} no existe`,
          );
        }
      }
    }

    // Verificar disponibilidad de stock para items con productoId.
    // Si el circuit breaker está abierto (ServiceUnavailableException), se registra
    // la venta en modo degradado y el Outbox se encarga de entregar el decremento
    // de stock cuando Inventario se recupere.
    let isDegraded = false;
    for (const item of dto.items) {
      if (item.productoId) {
        try {
          const disponible = await this.inventarioClient.isDisponible(
            item.productoId,
          );
          if (!disponible) {
            throw new BadRequestException(
              `Producto con id ${item.productoId} sin stock disponible`,
            );
          }
        } catch (error) {
          if (error instanceof ServiceUnavailableException) {
            isDegraded = true;
          } else {
            throw error;
          }
        }
      }
    }

    const total = dto.items.reduce(
      (sum, item) => sum + item.cantidad * item.precioUnitario,
      0,
    );

    // TODO (estudiante — Tarea 3.1): revisar esta transacción.
    // Observa que la Venta y el OutboxHttpCall se guardan en la MISMA transacción
    // de PostgreSQL. Si la transacción hace commit, el decremento de stock se
    // entregará eventualmente (at-least-once). Si hace rollback, tampoco queda
    // ningún OutboxHttpCall pendiente.
    const venta = await this.dataSource.transaction(async (manager) => {
      const newVenta = manager.create(Venta, {
        tiendaId: dto.tiendaId,
        fechaHora: dto.fechaHora,
        total,
        monedaId: dto.monedaId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        items: dto.items.map((item) => ({
          productoExternoId: item.productoExternoId || null,
          productoId: item.productoId || null,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          monedaId: dto.monedaId,
        })) as any,
      });
      const saved = await manager.save(newVenta);

      // Para cada item con productoId: crear un OutboxHttpCall que el publisher
      // enviará a POST /inventory/ventas/desde-outbox cuando Inventario esté disponible.
      for (const item of dto.items.filter((i) => i.productoId)) {
        await manager.save(OutboxHttpCall, {
          payload: {
            tiendaId: dto.tiendaId,
            productoId: item.productoId,
            ventaId: saved.id,
            cantidad: item.cantidad,
            fechaVenta: dto.fechaHora,
          },
          status: 'PENDING',
        });
      }

      return saved;
    });

    if (isDegraded) {
      return {
        ...this.mapToResponse(venta),
        status: 'pending_stock_confirmation',
        message:
          'Pedido registrado. La disponibilidad de stock será confirmada próximamente.',
      };
    }
    return this.mapToResponse(venta);
  }

  async findAll(query: QueryVentaDto): Promise<VentaResponseDto[]> {
    const ventas = await this.ventaRepository.findAll(query);
    return ventas.map((venta) => this.mapToResponse(venta));
  }

  async findById(id: string): Promise<VentaResponseDto> {
    const venta = await this.ventaRepository.findById(id);
    if (!venta) {
      throw new NotFoundException(`Venta con id ${id} no encontrada`);
    }
    return this.mapToResponse(venta);
  }

  async update(id: string, dto: UpdateVentaDto): Promise<VentaResponseDto> {
    const venta = await this.ventaRepository.findById(id);
    if (!venta) {
      throw new NotFoundException(`Venta con id ${id} no encontrada`);
    }

    // Si se actualizan los items, validar productos externos
    if (dto.items) {
      for (const item of dto.items) {
        const productoExists = await this.productoExternoRepository.findById(
          item.productoExternoId,
        );
        if (!productoExists) {
          throw new BadRequestException(
            `ProductoExterno con id ${item.productoExternoId} no existe`,
          );
        }

        // Validar que el producto del catálogo exista si se proporciona productoId
        if (item.productoId) {
          const productoExiste = await this.productoClient.exists(
            item.productoId,
          );
          if (!productoExiste) {
            throw new BadRequestException(
              `Producto con id ${item.productoId} no existe`,
            );
          }

          const disponible = await this.inventarioClient.isDisponible(
            item.productoId,
          );
          if (!disponible) {
            throw new BadRequestException(
              `Producto con id ${item.productoId} sin stock disponible`,
            );
          }
        }
      }

      // Recalcular el total
      const newTotal = dto.items.reduce(
        (sum, item) => sum + item.cantidad * item.precioUnitario,
        0,
      );

      // Actualizar items: eliminar los antiguos y crear los nuevos

      const updatedVenta = await this.ventaRepository.update(id, {
        ...dto,
        total: newTotal,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        items: dto.items.map((item) => ({
          productoExternoId: item.productoExternoId,
          productoId: item.productoId || null,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          monedaId: venta.monedaId,
        })) as any,
      });

      return this.mapToResponse(updatedVenta!);
    }

    // Si solo se actualiza fechaHora
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const updatedVenta = await this.ventaRepository.update(id, dto as any);
    return this.mapToResponse(updatedVenta!);
  }

  async delete(id: string): Promise<void> {
    const venta = await this.ventaRepository.findById(id);
    if (!venta) {
      throw new NotFoundException(`Venta con id ${id} no encontrada`);
    }

    await this.ventaRepository.delete(id);
  }

  private mapToResponse(venta: Venta): VentaResponseDto {
    return {
      id: venta.id,
      tiendaId: venta.tiendaId,
      fechaHora: venta.fechaHora,
      total: parseFloat(venta.total.toString()),
      monedaId: venta.monedaId,
      items: (venta.items || []).map((item) => this.mapItemToResponse(item)),
      createdAt: venta.createdAt,
      updatedAt: venta.updatedAt,
    };
  }

  private mapItemToResponse(item: ItemVenta): ItemVentaResponseDto {
    return {
      id: item.id,
      ventaId: item.ventaId,
      productoExternoId: item.productoExternoId || undefined,
      productoId: item.productoId || undefined,
      cantidad: item.cantidad,
      precioUnitario: parseFloat(item.precioUnitario.toString()),
      monedaId: item.monedaId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
