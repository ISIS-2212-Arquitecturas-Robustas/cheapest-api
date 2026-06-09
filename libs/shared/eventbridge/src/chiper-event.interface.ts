export interface ChiperEvent {
  source: 'chiper.ventas' | 'chiper.logistica';
  detailType: 'VentaCreada' | 'PedidoCreado' | 'PedidoCambioEstado';
  detail: Record<string, unknown>;
}
