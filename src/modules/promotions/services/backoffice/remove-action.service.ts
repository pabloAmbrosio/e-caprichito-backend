/**
 * Servicio para eliminar una acción de una promoción.
 * Eliminación definitiva (hard delete), no soft delete.
 */
import { db } from '../../../../lib/prisma';
import { ActionNotFoundError } from '../../errors';

/**
 * Elimina una PromotionAction por su ID.
 * Valida que la acción pertenezca a la promoción indicada.
 *
 * @param promotionId - ID de la promoción padre
 * @param actionId - ID de la acción a eliminar
 * @returns La acción eliminada
 * @throws Error si la acción no existe o no pertenece a la promoción
 */
export const removeActionService = async (promotionId: string, actionId: string) => {
  /** Verificar que la acción existe y pertenece a la promoción */
  const action = await db.promotionAction.findUnique({
    where: { id: actionId },
  });

  if (!action || action.promotionId !== promotionId) {
    throw new ActionNotFoundError();
  }

  /** Eliminar definitivamente la acción */
  const deleted = await db.promotionAction.delete({
    where: { id: actionId },
  });

  return { msg: "Accion eliminada", data: deleted };
};
