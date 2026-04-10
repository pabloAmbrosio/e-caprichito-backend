/**
 * Schema de validación para agregar una acción a una promoción.
 * Valida el body de la petición POST /promotions/:id/actions.
 *
 * Validación custom por tipo de acción:
 * - PERCENTAGE_DISCOUNT: value debe ser un número entre 0.01 y 100
 * - FIXED_DISCOUNT: value debe ser un número positivo (monto en dólares)
 * - BUY_X_GET_Y: value debe ser formato "X:Y" con enteros positivos
 */
import * as v from 'valibot';
import { ACTION_TYPES, ACTION_TARGETS } from '../constants';

export const CreateActionSchema = v.pipe(
  v.object({
    type: v.pipe(
      v.string('El tipo de acción debe ser texto'),
      v.picklist(ACTION_TYPES, 'Tipo de acción inválido. Valores permitidos: PERCENTAGE_DISCOUNT, FIXED_DISCOUNT, BUY_X_GET_Y')
    ),

    /**
     * Valor de la acción como string:
     * - PERCENTAGE_DISCOUNT: "20" (porcentaje)
     * - FIXED_DISCOUNT: "50.00" (monto en dólares)
     * - BUY_X_GET_Y: "2:1" (compra:gratis)
     */
    value: v.pipe(
      v.string('El valor debe ser texto'),
      v.nonEmpty('El valor es requerido'),
      v.maxLength(100, 'El valor no puede tener más de 100 caracteres')
    ),

    /** Tope máximo de descuento en centavos (opcional, null = sin tope) */
    maxDiscountInCents: v.optional(
      v.nullable(
        v.pipe(
          v.number('El descuento máximo debe ser un número'),
          v.integer('El descuento máximo debe ser un entero (centavos)'),
          v.minValue(1, 'El descuento máximo debe ser al menos 1 centavo')
        )
      )
    ),

    target: v.pipe(
      v.string('El target debe ser texto'),
      v.picklist(ACTION_TARGETS, 'Target inválido. Valores permitidos: PRODUCT, CART, CHEAPEST_ITEM')
    ),
  }),
  v.check((input) => {
    const { type, value } = input;

    switch (type) {
      case 'PERCENTAGE_DISCOUNT': {
        const percentage = parseFloat(value);
        return !isNaN(percentage) && percentage > 0 && percentage <= 100;
      }

      case 'FIXED_DISCOUNT': {
        const amount = parseFloat(value);
        return !isNaN(amount) && amount > 0;
      }

      case 'BUY_X_GET_Y': {
        const parts = value.split(':');
        if (parts.length !== 2) return false;
        const buyCount = parseInt(parts[0], 10);
        const freeCount = parseInt(parts[1], 10);
        return !isNaN(buyCount) && !isNaN(freeCount) && buyCount >= 1 && freeCount >= 1;
      }

      default:
        return true;
    }
  }, 'Valor inválido para el tipo de acción. PERCENTAGE_DISCOUNT: número entre 0.01-100. FIXED_DISCOUNT: número positivo. BUY_X_GET_Y: formato "X:Y" (ej: "2:1").')
);

export type CreateActionInput = v.InferInput<typeof CreateActionSchema>;
