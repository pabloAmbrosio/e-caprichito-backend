/**
 * Servicio para listar promociones con paginación y filtros.
 * Soporta búsqueda por nombre/cupón, filtro por estado activo, y ordenamiento.
 */
import { db } from '../../../../lib/prisma';
import { PAGINATION } from '../../constants';
import { promotionWithDetailsInclude } from '../../promotion.selects';
import type { ListPromotionsInput } from '../../schemas';

/**
 * Lista promociones paginadas con filtros opcionales.
 *
 * @param params - Parámetros de búsqueda y paginación validados
 * @returns Objeto con data (promociones), total, page y limit
 */
export const listPromotionsService = async (params: ListPromotionsInput) => {
  const page = Number(params.page ?? PAGINATION.DEFAULT_PAGE);
  const limit = Number(params.limit ?? PAGINATION.DEFAULT_LIMIT);
  const skip = (page - 1) * limit;

  /** Construir condiciones de filtrado */
  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  /** Filtrar por estado activo/inactivo */
  if (params.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  /** Búsqueda por nombre o código de cupón (case-insensitive) */
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { couponCode: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  /** Definir ordenamiento */
  const orderBy: Record<string, string> = {};
  orderBy[params.sortBy ?? 'createdAt'] = params.sortOrder ?? 'desc';

  /** Ejecutar consultas en paralelo: datos + conteo total */
  const [promotions, total] = await Promise.all([
    db.promotion.findMany({
      where,
      include: promotionWithDetailsInclude,
      orderBy,
      skip,
      take: limit,
    }),
    db.promotion.count({ where }),
  ]);

  return {
    msg: "Promociones listadas",
    data: {
      items: promotions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  };
};
