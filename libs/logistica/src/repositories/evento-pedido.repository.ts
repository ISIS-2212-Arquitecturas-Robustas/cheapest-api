import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EventoPedido } from './entities/evento-pedido.entity';

@Injectable()
export class EventoPedidoRepository {
  constructor(
    @Inject('EVENTO_PEDIDO_REPOSITORY')
    private readonly repository: Repository<EventoPedido>,
  ) {}

  // TODO (estudiante): Implementar nextVersion() y appendEvent()
  // nextVersion() debe retornar el siguiente número de versión para un pedidoId dado.
  // appendEvent() debe persistir un nuevo evento en la tabla eventos_pedido.

  async nextVersion(pedidoId: string): Promise<number> {
    // TODO: buscar el último evento del pedido ordenado por version DESC
    // Si no existe ninguno, retornar 1
    throw new Error('Not implemented — completa este método');
  }

  async appendEvent(
    data: Omit<EventoPedido, 'id' | 'createdAt'>,
  ): Promise<EventoPedido> {
    // TODO: crear y guardar el evento usando this.repository
    throw new Error('Not implemented — completa este método');
  }

  async findByPedidoId(pedidoId: string): Promise<EventoPedido[]> {
    return this.repository.find({
      where: { pedidoId },
      order: { version: 'ASC' },
    });
  }
}
