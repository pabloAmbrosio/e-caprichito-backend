import * as v from 'valibot';
import { coerceInteger } from '../../shared/schemas/coerce';

export const GetLikedProductsSchema = v.object({
  limit: v.optional(
    v.pipe(
      coerceInteger,
      v.integer('El límite debe ser un entero'),
      v.minValue(1, 'El límite debe ser al menos 1'),
      v.maxValue(100, 'El límite no puede exceder 100'),
    ),
  ),
  offset: v.optional(
    v.pipe(
      coerceInteger,
      v.integer('El offset debe ser un entero'),
      v.minValue(0, 'El offset no puede ser negativo'),
      v.maxValue(10_000, 'El offset no puede exceder 10,000'),
    ),
  ),
});

export type GetLikedProductsInput = v.InferOutput<typeof GetLikedProductsSchema>;
