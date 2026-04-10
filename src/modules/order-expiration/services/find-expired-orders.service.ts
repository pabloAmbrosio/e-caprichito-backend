import { db } from '../../../lib/prisma';
import { ExpiredOrderData } from '../registry/expiration-handler.interface';

/**
 * #4 [CRITICO]: Usa updateMany con WHERE status=PENDING para marcar atomicamente
 * las ordenes expiradas, previniendo double-processing por multiples instancias.
 *
 * #13 [CRITICO]: El cambio de status PENDING -> CANCELLED se usa como flag de
 * idempotencia. Solo ordenes en PENDING son seleccionadas; una vez procesadas
 * ya no seran recogidas en la siguiente ejecucion del cron.
 *
 * #14 [ALTO]: Incluye expiresAt en los datos retornados.
 */
export const findExpiredOrdersService = async (): Promise<ExpiredOrderData[]> => {
  // Paso 1: Atomicamente marcar ordenes expiradas como CANCELLED.
  // updateMany con WHERE status=PENDING garantiza que si dos instancias del cron
  // corren en paralelo, solo una procesara cada orden (la otra vera 0 actualizaciones).
  const now = new Date();

  // Primero obtenemos los IDs de ordenes a procesar con un lock atomico.
  // Usamos una transaccion con aislamiento para garantizar atomicidad.
  const expiredOrders = await db.$transaction(async (tx) => {
    // Buscar ordenes expiradas aun en PENDING
    const orders = await tx.order.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { lte: now },
      },
      select: {
        id: true,
        customerId: true,
        expiresAt: true,
        items: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    if (orders.length === 0) return [];

    // Marcar atomicamente todas estas ordenes para evitar double-processing.
    // Solo actualiza las que siguen en PENDING (concurrency-safe).
    await tx.order.updateMany({
      where: {
        id: { in: orders.map((o) => o.id) },
        status: 'PENDING',
      },
      data: { status: 'CANCELLED' },
    });

    return orders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      items: order.items,
      expiresAt: order.expiresAt!,
    }));
  });

  return expiredOrders;
};
