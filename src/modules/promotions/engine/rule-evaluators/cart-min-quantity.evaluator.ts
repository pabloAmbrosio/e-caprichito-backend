/**
 * Evaluador de reglas de tipo CART_MIN_QUANTITY.
 *
 * Evalúa si la cantidad total de items en el carrito cumple con un umbral.
 * Se suma la cantidad (quantity) de todos los items, no el número de líneas.
 * El campo `value` contiene la cantidad como string numérico (ej: "3", "5").
 *
 * Operadores soportados:
 * - EQUALS: la cantidad total es exactamente igual al valor
 * - GREATER_THAN: la cantidad total es mayor que el valor
 * - LESS_THAN: la cantidad total es menor que el valor
 * - GREATER_OR_EQUAL: la cantidad total es mayor o igual al valor
 * - LESS_OR_EQUAL: la cantidad total es menor o igual al valor
 */
import type { IRuleEvaluator } from './rule-evaluator.interface';
import type { CartMinQuantityRule } from '../../types';
import type { PromotionContext } from '../../types';

export class CartMinQuantityEvaluator implements IRuleEvaluator<CartMinQuantityRule> {
  /**
   * Evalúa si la cantidad total de items en el carrito cumple la condición.
   *
   * @param rule - Regla con type='CART_MIN_QUANTITY', operador numérico y valor
   * @param context - Contexto con los items del carrito
   * @returns true si la cantidad total cumple la condición
   */
  evaluate(rule: CartMinQuantityRule, context: PromotionContext): boolean {
    /** Cantidad total de items en el carrito (suma de todas las quantities) */
    const totalQuantity = context.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    /** Valor numérico de la regla (parseado de string a number) */
    const threshold = parseInt(rule.value, 10);

    /** Si el valor no es un número válido, la regla no se cumple */
    if (isNaN(threshold)) return false;

    switch (rule.operator) {
      case 'EQUALS':
        return totalQuantity === threshold;

      case 'GREATER_THAN':
        return totalQuantity > threshold;

      case 'LESS_THAN':
        return totalQuantity < threshold;

      case 'GREATER_OR_EQUAL':
        return totalQuantity >= threshold;

      case 'LESS_OR_EQUAL':
        return totalQuantity <= threshold;

      default:
        return false;
    }
  }
}
