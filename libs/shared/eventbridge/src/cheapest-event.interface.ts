export interface CheapestEvent {
  source: 'cheapest.ventas' | 'cheapest.logistica';
  detailType: 'VentaCreada' | 'PedidoCreado' | 'PedidoCambioEstado';
  detail: Record<string, unknown>;
}
