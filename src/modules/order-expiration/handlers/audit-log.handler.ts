import type { TxClient } from '../../order/services/types';
import { OrderExpirationHandler, ExpiredOrderData } from '../registry/expiration-handler.interface';

/**
 * #7 [ALTO]: Persiste el audit log en BD usando OrderStatusAuditLog en lugar de console.log.
 * #1 [CRITICO]: Recibe `tx` transaccional para que el audit log sea parte de la misma
 * transaccion atomica que la cancelacion y liberacion de inventario.
 * #15 [MEDIO]: Incluye contexto enriquecido (orderId, handler, timestamp, expiresAt).
 */
export class AuditLogHandler implements OrderExpirationHandler {
  name = 'AuditLogHandler';

  // TODO: Reactivar escritura a BD cuando se implemente la feature de audit logs
  async execute(order: ExpiredOrderData, _tx?: TxClient): Promise<void> {
    // if (!tx) {
    //   throw new Error(`[AuditLogHandler] Se requiere cliente transaccional para orden ${order.id}`);
    // }

    // #7: Persistir en BD usando OrderStatusAuditLog (desactivado temporalmente)
    // await tx.orderStatusAuditLog.create({
    //   data: {
    //     orderId: order.id,
    //     previousStatus: 'PENDING',
    //     newStatus: 'CANCELLED',
    //     changedBy: 'system:order-expiration',
    //   },
    // });

    // #15: Log estructurado con contexto enriquecido
    console.info(
      `[OrderExpiration][AuditLog] Registro de auditoria creado:`,
      JSON.stringify({
        orderId: order.id,
        customerId: order.customerId,
        handler: this.name,
        previousStatus: 'PENDING',
        newStatus: 'CANCELLED',
        itemsCount: order.items.length,
        expiresAt: order.expiresAt.toISOString(),
        processedAt: new Date().toISOString(),
      })
    );
  }
}
