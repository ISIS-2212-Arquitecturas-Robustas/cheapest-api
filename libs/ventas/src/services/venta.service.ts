import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventBridgeService } from '../../../shared/eventbridge/src';
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
import { Venta } from '../repositories/entities/venta.entity';
import { ProductoExternoRepository } from '../repositories/producto-externo.repository';
import { VentaRepository } from '../repositories/venta.repository';

@Injectable()
export class VentaService {
  constructor(
    private readonly ventaRepository: VentaRepository,
    private readonly productoExternoRepository: ProductoExternoRepository,
    private readonly tiendaClient: TiendaClientMock,
    private readonly productoClient: LogisticaProductosClient,
    private readonly eventBridgeService: EventBridgeService,
  ) {}

  async create(dto: CreateVentaDto): Promise<VentaResponseDto> {
    const tiendaExists = await this.tiendaClient.exists(dto.tiendaId);
    if (!tiendaExists) {
      throw new BadRequestException(`Tienda con id ${dto.tiendaId} no existe`);
    }

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

    const total = dto.items.reduce(
      (sum, item) => sum + item.cantidad * item.precioUnitario,
      0,
    );

    const venta = await this.ventaRepository.create({
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

    // Publicación directa a EventBridge — garantía at-most-once.
    // Si EventBridge no está disponible en este momento, el evento se pierde.
    await this.eventBridgeService.publish({
      source: 'cheapest.ventas',
      detailType: 'VentaCreada',
      detail: {
        ventaId: venta.id,
        tiendaId: venta.tiendaId,
        total: venta.total,
        monedaId: venta.monedaId,
        fechaHora: venta.fechaHora,
        items: dto.items.map((i) => ({
          productoId: i.productoId ?? null,
          productoExternoId: i.productoExternoId,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
        })),
      },
    });

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

        if (item.productoId) {
          const productoExiste = await this.productoClient.exists(
            item.productoId,
          );
          if (!productoExiste) {
            throw new BadRequestException(
              `Producto con id ${item.productoId} no existe`,
            );
          }
        }
      }

      const newTotal = dto.items.reduce(
        (sum, item) => sum + item.cantidad * item.precioUnitario,
        0,
      );

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
