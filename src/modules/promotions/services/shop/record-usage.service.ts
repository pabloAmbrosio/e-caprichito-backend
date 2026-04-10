/**
 * Servicio para registrar el uso de una promocion en una orden.
 * Se llama DENTRO de la transaccion de creacion de orden para garantizar atomicidad.
 */
import { db } from '../../../../lib/prisma';
import type { DbClient } from '../../../../lib/prisma';
import type { RecordUsageData } from '../../types';

/**
 * Registra un uso de promocion en la tabla PromotionUsage.
 *
 * Este servicio se llama despues de crear una orden exitosamente,
 * dentro de la misma transaccion, para que si la orden falla
 * el uso tampoco se registre.
 *
 * @param data - Datos del uso (promotionId, userId, orderId, discountAmountInCents)
 * @param tx - #16 [BAJO]: Cliente Prisma transaccional opcional. Cuando se proporciona,
 *             la operacion de escritura se ejecuta dentro de la transaccion activa,
 *             garantizando que el registro de uso sea atomico con la creacion de la orden.
 *             Si la transaccion falla (ej: error al crear la orden), el uso se revierte
 *             automaticamente. Si no se proporciona, usa el cliente global `db`.
 *
 *             Ejemplo de uso dentro de una transaccion:
 *             ```typescript
 *             await db.$transaction(async (tx) => {
 *               const order = await tx.order.create({ ... });
 *               await recordUsageService(usageData, tx);
 *               // Si algo falla aqui, ambas operaciones se revierten
 *             });
 *             ```
 * @returns El registro de uso creado
 */
export const recordUsageService = async (
  data: RecordUsageData,
  tx?: DbClient
) => {
  /** Usar la transacción si fue proporcionada, o el cliente global */
  const client = tx ?? db;

  const usage = await client.promotionUsage.create({
    data: {
      promotionId: data.promotionId,
      userId: data.userId,
      orderId: data.orderId,
      discountAmountInCents: data.discountAmountInCents,
    },
  });

  return usage;
};
