import * as v from 'valibot';
import { REVIEW_ACTIONS } from '../../constants';

export const ReviewPaymentParamsSchema = v.object({
  id: v.pipe(
    v.string('El ID del pago debe ser texto'),
    v.uuid('ID de pago inválido')
  ),
});

export type ReviewPaymentParams = v.InferInput<typeof ReviewPaymentParamsSchema>;

export const ReviewPaymentBodySchema = v.object({
  action: v.pipe(
    v.string('La acción debe ser texto'),
    v.picklist(REVIEW_ACTIONS, 'Acción inválida. Usa APPROVE o REJECT')
  ),

  note: v.optional(
    v.pipe(
      v.string('La nota debe ser texto'),
      v.maxLength(500, 'La nota no puede exceder 500 caracteres')
    )
  ),
});

export type ReviewPaymentBody = v.InferInput<typeof ReviewPaymentBodySchema>;
