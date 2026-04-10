import type { TxClient } from '../../order/services/types';

/**
 * #14 [ALTO]: Agregado `expiresAt` para que los handlers tengan acceso al timestamp de expiracion.
 * Datos de una orden expirada que se pasan a cada handler del pipeline de expiracion.
 */
export interface ExpiredOrderData {
  id: string;
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
  /** #14: Fecha/hora en que la orden expiro */
  expiresAt: Date;
}

export interface OrderExpirationHandler {
  name: string;
  execute(order: ExpiredOrderData, tx?: TxClient): Promise<void>;
}
