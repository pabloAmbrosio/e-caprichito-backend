/**
 * Servicio para validar un código de cupón antes de aplicarlo.
 * Verifica existencia, activación, vigencia y límites de uso.
 *
 * #4 [MEDIO]: Usa la función centralizada getGracePeriod() en lugar de
 * duplicar la lógica de lectura de la variable de entorno.
 */
import { db } from '../../../../lib/prisma';
import type { DbClientOrTx } from '../../../../lib/prisma';
import { getGracePeriod } from '../../constants';
import { promotionWithRulesAndActionsInclude } from '../../promotion.selects';
import { CouponNotFoundError, PromotionNotActiveError, PromotionNotStartedError, PromotionExpiredError, MaxUsesReachedError } from '../../errors';

/**
 * Valida que un código de cupón sea válido y usable por el usuario.
 *
 * Verificaciones:
 * 1. La promoción con ese couponCode existe y no fue eliminada
 * 2. La promoción está activa (isActive === true)
 * 3. La fecha actual está dentro del rango startsAt - endsAt
 * 4. El usuario no ha alcanzado el límite de usos (maxUsesPerUser)
 *
 * @param couponCode - Código de cupón a validar
 * @param userId - ID del usuario que quiere usar el cupón
 * @param tx - Cliente Prisma transaccional opcional. Si se proporciona, todas las
 *             queries se ejecutan dentro de la transacción para garantizar consistencia.
 * @returns La promoción válida con sus reglas y acciones
 * @throws Error descriptivo si el cupón no es válido
 */
export const validateCouponService = async (
  couponCode: string,
  userId: string,
  tx?: DbClientOrTx
) => {
  /** Usar la transacción si fue proporcionada, o el cliente global */
  const client = tx ?? db;

  /** Buscar la promoción por couponCode */
  const promotion = await (client as any).promotion.findUnique({
    where: { couponCode },
    include: promotionWithRulesAndActionsInclude,
  });

  /** Verificar existencia */
  if (!promotion || promotion.deletedAt) {
    throw new CouponNotFoundError();
  }

  /** Verificar que está activa */
  if (!promotion.isActive) {
    throw new PromotionNotActiveError();
  }

  const now = new Date();

  /** Verificar que ya comenzó */
  if (promotion.startsAt > now) {
    throw new PromotionNotStartedError();
  }

  /** #4 [MEDIO]: Grace period centralizado */
  const gracePeriodMinutes = getGracePeriod();
  const effectiveNow = new Date(now.getTime() - gracePeriodMinutes * 60 * 1000);

  /** Verificar que no ha expirado (con margen de gracia) */
  if (promotion.endsAt && promotion.endsAt < effectiveNow) {
    throw new PromotionExpiredError();
  }

  /** Verificar límite de usos por usuario */
  if (promotion.maxUsesPerUser !== null) {
    const usageCount = await (client as any).promotionUsage.count({
      where: {
        promotionId: promotion.id,
        userId,
      },
    });

    if (usageCount >= promotion.maxUsesPerUser) {
      throw new MaxUsesReachedError();
    }
  }

  return promotion;
};
