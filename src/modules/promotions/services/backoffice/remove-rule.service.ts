/**
 * Servicio para eliminar una regla de una promoción.
 * Eliminación definitiva (hard delete), no soft delete.
 */
import { db } from '../../../../lib/prisma';
import { RuleNotFoundError } from '../../errors';

/**
 * Elimina una PromotionRule por su ID.
 * Valida que la regla pertenezca a la promoción indicada.
 *
 * @param promotionId - ID de la promoción padre
 * @param ruleId - ID de la regla a eliminar
 * @returns La regla eliminada
 * @throws Error si la regla no existe o no pertenece a la promoción
 */
export const removeRuleService = async (promotionId: string, ruleId: string) => {
  /** Verificar que la regla existe y pertenece a la promoción */
  const rule = await db.promotionRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule || rule.promotionId !== promotionId) {
    throw new RuleNotFoundError();
  }

  /** Eliminar definitivamente la regla */
  const deleted = await db.promotionRule.delete({
    where: { id: ruleId },
  });

  return { msg: "Regla eliminada", data: deleted };
};
