/**
 * Evaluador de reglas de tipo CART_MIN_TOTAL.
 *
 * Evalúa si el monto total del carrito cumple con un umbral numérico.
 * El campo `value` contiene el monto como string numérico (ej: "100", "250.50").
 *
 * Operadores soportados:
 * - EQUALS: el total es exactamente igual al valor
 * - GREATER_THAN: el total es mayor que el valor
 * - LESS_THAN: el total es menor que el valor
 * - GREATER_OR_EQUAL: el total es mayor o igual al valor
 * - LESS_OR_EQUAL: el total es menor o igual al valor
 */
import type { IRuleEvaluator } from './rule-evaluator.interface';
import type { CartMinTotalRule } from '../../types';
import type { PromotionContext } from '../../types';
import { dollarsToCents } from '../../constants';

export class CartMinTotalEvaluator implements IRuleEvaluator<CartMinTotalRule> {
  /**
   * Evalua si el total del carrito cumple la condicion numerica de la regla.
   *
   * @param rule - Regla con type='CART_MIN_TOTAL', operador numerico y valor
   * @param context - Contexto con el cartTotalInCents calculado
   * @returns true si el total del carrito cumple la condicion
   */
  evaluate(rule: CartMinTotalRule, context: PromotionContext): boolean {
    /** #8 [MEDIO]: Valor de la regla convertido a centavos con funcion centralizada */
    const thresholdInCents = dollarsToCents(rule.value);

    /** Si el valor no es un número válido, la regla no se cumple */
    if (isNaN(thresholdInCents)) return false;

    switch (rule.operator) {
      case 'EQUALS':
        return context.cartTotalInCents === thresholdInCents;

      case 'GREATER_THAN':
        return context.cartTotalInCents > thresholdInCents;

      case 'LESS_THAN':
        return context.cartTotalInCents < thresholdInCents;

      case 'GREATER_OR_EQUAL':
        return context.cartTotalInCents >= thresholdInCents;

      case 'LESS_OR_EQUAL':
        return context.cartTotalInCents <= thresholdInCents;

      default:
        return false;
    }
  }
}
