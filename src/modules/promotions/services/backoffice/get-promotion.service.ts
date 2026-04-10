/**
 * Servicio para obtener una promoción por su ID.
 * Incluye las reglas y acciones asociadas.
 */
import { db } from '../../../../lib/prisma';
import { PromotionNotFoundError } from '../../errors';
import { promotionWithDetailsInclude } from '../../promotion.selects';

/**
 * Obtiene una promoción por ID con sus reglas y acciones.
 * Filtra promociones soft-deleted.
 *
 * @param id - ID de la promoción
 * @returns La promoción con rules y actions incluidas
 * @throws Error si la promoción no existe o fue eliminada
 */
export const getPromotionService = async (id: string) => {
  const promotion = await db.promotion.findUnique({
    where: { id },
    include: promotionWithDetailsInclude,
  });

  if (!promotion || promotion.deletedAt) {
    throw new PromotionNotFoundError();
  }

  return { msg: "Promocion obtenida", data: promotion };
};
