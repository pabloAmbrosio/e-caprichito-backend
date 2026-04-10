import * as v from 'valibot';
import { PAYMENT_METHODS } from '../../constants';

export const SubmitPaymentSchema = v.object({
  orderId: v.pipe(
    v.string('El ID de la orden debe ser texto'),
    v.uuid('ID de orden inválido')
  ),

  method: v.pipe(
    v.string('El método de pago debe ser texto'),
    v.picklist(PAYMENT_METHODS, 'Método de pago inválido. Valores permitidos: MANUAL_TRANSFER')
  ),
});

export type SubmitPaymentInput = v.InferInput<typeof SubmitPaymentSchema>;
