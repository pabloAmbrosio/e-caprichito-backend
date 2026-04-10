import { Server } from 'socket.io';
import { OrderExpirationHandler, ExpiredOrderData } from '../registry/expiration-handler.interface';

/**
 * #12 [MEDIO]: Agrega try-catch alrededor del emit de Socket.IO con logging estructurado.
 * #15 [MEDIO]: Incluye contexto enriquecido en logs (orderId, handler, timestamp).
 *
 * Nota: Este handler NO recibe tx porque no realiza operaciones de BD.
 * Si el emit falla, se loguea el error pero no se lanza excepcion
 * para no afectar el pipeline transaccional.
 */
export class NotifySocketHandler implements OrderExpirationHandler {
  name = 'NotifySocketHandler';

  constructor(private io: Server) {}

  async execute(order: ExpiredOrderData): Promise<void> {
    try {
      this.io.to(`user:${order.customerId}`).emit('order:expired', {
        orderId: order.id,
        expiresAt: order.expiresAt.toISOString(),
        message: 'Tu orden ha expirado por falta de pago. El inventario reservado ha sido liberado.',
      });
    } catch (error: unknown) {
      // #12: No relanzar el error para no interrumpir el pipeline
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error(
        `[OrderExpiration][NotifySocket] Error al emitir evento socket para orden ${order.id}:`,
        JSON.stringify({
          orderId: order.id,
          customerId: order.customerId,
          handler: this.name,
          error: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }
}
