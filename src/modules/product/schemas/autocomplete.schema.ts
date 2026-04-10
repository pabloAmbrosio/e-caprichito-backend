import * as v from 'valibot';
import { coerceInteger } from '../../shared/schemas/coerce';

export const AutocompleteSchema = v.object({
  q: v.pipe(
    v.string('El término de búsqueda debe ser texto'),
    v.trim(),
    v.minLength(1, 'El término de búsqueda no puede estar vacío'),
    v.maxLength(100, 'El término de búsqueda no puede exceder 100 caracteres'),
  ),
  limit: v.optional(
    v.pipe(
      coerceInteger,
      v.number('El límite debe ser un número'),
      v.integer('El límite debe ser un entero'),
      v.minValue(1, 'El límite debe ser al menos 1'),
      v.maxValue(20, 'El límite no puede exceder 20'),
    ),
    8,
  ),
});

export type AutocompleteInput = v.InferOutput<typeof AutocompleteSchema>;
