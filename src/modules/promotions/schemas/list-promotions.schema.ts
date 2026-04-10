/**
 * Schema de validación para los query params del listado de promociones.
 * Valida los parámetros de la petición GET /promotions.
 */
import * as v from 'valibot';

/** Schema de validación para query params de listado paginado */
export const ListPromotionsSchema = v.object({
  /** Número de página (default: 1) */
  page: v.optional(
    v.pipe(
      v.union([v.string(), v.number()]),
      v.transform(Number),
      v.number('La página debe ser un número'),
      v.minValue(1, 'La página debe ser al menos 1')
    )
  ),

  /** Cantidad de resultados por página (default: 20) */
  limit: v.optional(
    v.pipe(
      v.union([v.string(), v.number()]),
      v.transform(Number),
      v.number('El límite debe ser un número'),
      v.minValue(1, 'El límite debe ser al menos 1'),
      v.maxValue(100, 'El límite no puede ser mayor a 100')
    )
  ),

  /** Filtrar por estado activo/inactivo (opcional) */
  isActive: v.optional(
    v.pipe(
      v.union([v.string(), v.boolean()]),
      v.transform((val) => val === 'true' || val === true)
    )
  ),

  /** Búsqueda por nombre o código de cupón */
  search: v.optional(
    v.pipe(
      v.string('La búsqueda debe ser texto'),
      v.maxLength(200, 'La búsqueda no puede tener más de 200 caracteres')
    )
  ),

  /** Campo por el que ordenar */
  sortBy: v.optional(
    v.pipe(
      v.string('El campo de orden debe ser texto'),
      v.picklist(
        ['name', 'priority', 'startsAt', 'endsAt', 'createdAt'],
        'Campo de orden inválido'
      )
    )
  ),

  /** Dirección del orden: ascendente o descendente */
  sortOrder: v.optional(
    v.pipe(
      v.string('La dirección de orden debe ser texto'),
      v.picklist(['asc', 'desc'], 'Dirección de orden inválida. Valores: asc, desc')
    )
  ),
});

/** Tipo inferido del schema de listado de promociones */
export type ListPromotionsInput = v.InferInput<typeof ListPromotionsSchema>;
