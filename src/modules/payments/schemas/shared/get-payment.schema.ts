import * as v from 'valibot';
import { PAYMENT_STATUSES } from '../../constants';

export const PaymentIdSchema = v.object({
  id: v.pipe(
    v.string('El ID del pago debe ser texto'),
    v.uuid('ID de pago inválido')
  ),
});

export type PaymentIdParams = v.InferInput<typeof PaymentIdSchema>;

export const ListPaymentsQuerySchema = v.object({
  page: v.optional(
    v.pipe(
      v.string('Page debe ser un string'),
      v.transform(Number),
      v.number('Page debe ser un número'),
      v.integer('Page debe ser un entero'),
      v.minValue(1, 'Page debe ser mayor o igual a 1')
    ),
    '1'
  ),

  limit: v.optional(
    v.pipe(
      v.string('Limit debe ser un string'),
      v.transform(Number),
      v.number('Limit debe ser un número'),
      v.integer('Limit debe ser un entero'),
      v.minValue(1, 'Limit debe ser mayor o igual a 1'),
      v.maxValue(100, 'Limit no puede ser mayor a 100')
    ),
    '20'
  ),

  status: v.optional(
    v.picklist(PAYMENT_STATUSES, 'Estado de pago inválido')
  ),
});

export type ListPaymentsQuery = v.InferOutput<typeof ListPaymentsQuerySchema>;
