/**
 * Servicio para eliminar (soft delete) una promoción.
 * No la borra de la base de datos, sino que marca deletedAt con la fecha actual.
 */
import { db } from '../../../../lib/prisma';
import { PromotionNotFoundError, PromotionAlreadyDeletedError } from '../../errors';

/**
 * Soft delete de una promoción: marca deletedAt con la fecha actual.
 * Si ya fue eliminada, lanza error.
 *
 * @param id - ID de la promoción a eliminar
 * @returns La promoción con deletedAt actualizado
 * @throws Error si la promoción no existe o ya fue eliminada
 */
export const deletePromotionService = async (id: string) => {
  /** Verificar que la promoción existe */
  const existing = await db.promotion.findUnique({ where: { id } });

  if (!existing) {
    throw new PromotionNotFoundError();
  }

  if (existing.deletedAt) {
    throw new PromotionAlreadyDeletedError();
  }

  /** Marcar como eliminada con la fecha actual */
  const promotion = await db.promotion.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { msg: "Promocion eliminada", data: promotion };
};
