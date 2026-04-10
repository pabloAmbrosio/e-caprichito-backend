/**
 * Schema de validación para el parámetro :id de promoción en la URL.
 * Valida que el ID sea un string no vacío (UUID).
 */
import * as v from 'valibot';

/** Schema que valida el parámetro :id de la URL como string UUID */
export const PromotionIdSchema = v.object({
  id: v.pipe(
    v.string('El ID de la promoción debe ser texto'),
    v.nonEmpty('El ID de la promoción es requerido')
  ),
});

/** Tipo inferido del schema de ID de promoción */
export type PromotionIdInput = v.InferInput<typeof PromotionIdSchema>;
