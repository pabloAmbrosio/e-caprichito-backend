import { Server } from 'socket.io';
import { OrderExpirationRegistry } from './registry/expiration-registry';
import { CancelOrderHandler } from './handlers/cancel-order.handler';
import { FailShipmentHandler } from './handlers/fail-shipment.handler';
import { NotifySocketHandler } from './handlers/notify-socket.handler';
import { AuditLogHandler } from './handlers/audit-log.handler';
import { startOrderExpirationJob } from './jobs/order-expiration.job';

/**
 * #11 [MEDIO]: Inicializa el modulo de expiracion de ordenes.
 *
 * Configura el pipeline de handlers en orden de ejecucion:
 * 1. CancelOrderHandler - Cancela la orden y libera inventario (transaccional)
 * 2. NotifySocketHandler - Notifica al usuario via Socket.IO (no transaccional)
 * 3. AuditLogHandler - Registra el cambio en OrderStatusAuditLog (transaccional)
 *
 * El cron job se ejecuta segun ORDER_CRON_INTERVAL (default: cada 1 minuto).
 * Expresion cron: '* /1 * * * *' = segundo 0 de cada minuto.
 *
 * @param io - Instancia de Socket.IO Server para notificaciones en tiempo real
 */
export const initOrderExpiration = (io: Server) => {
  const registry = new OrderExpirationRegistry();

  // Registrar handlers (orden importa: cancelar → fail shipment → notificar → audit)
  registry.register(new CancelOrderHandler());
  registry.register(new FailShipmentHandler());
  registry.register(new NotifySocketHandler(io));
  registry.register(new AuditLogHandler());

  // Iniciar cron job con intervalo configurable
  const interval = process.env.ORDER_CRON_INTERVAL || '*/1 * * * *';
  startOrderExpirationJob(registry, interval);
};
