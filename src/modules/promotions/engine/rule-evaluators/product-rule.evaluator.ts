/**
 * Evaluador de reglas de tipo PRODUCT.
 *
 * Evalúa si algún producto del carrito cumple con la condición especificada.
 * El campo `value` de la regla contiene el ID del producto (o IDs separados por coma).
 *
 * Operadores soportados:
 * - EQUALS: algún item del carrito tiene exactamente ese productId
 * - NOT_EQUALS: ningún item del carrito tiene ese productId
 * - IN: algún item del carrito tiene un productId que está en la lista
 * - NOT_IN: ningún item del carrito tiene un productId que esté en la lista
 */
import type { IRuleEvaluator } from './rule-evaluator.interface';
import type { ProductRule } from '../../types';
import type { PromotionContext } from '../../types';

export class ProductRuleEvaluator implements IRuleEvaluator<ProductRule> {
  /**
   * Evalúa si algún producto del carrito coincide con la regla.
   *
   * @param rule - Regla con type='PRODUCT', operador y valor (productId o lista)
   * @param context - Contexto con los items del carrito
   * @returns true si la condición del producto se cumple
   */
  evaluate(rule: ProductRule, context: PromotionContext): boolean {
    /**
     * #15 [ALTO]: Filtrar items con productId undefined o null.
     * Esto previene errores silenciosos cuando el carrito contiene items
     * con datos incompletos (ej: producto eliminado pero aún en carrito).
     */
    const cartProductIds = context.cartItems
      .filter((item) => item.productId != null)
      .map((item) => item.productId);

    switch (rule.operator) {
      case 'EQUALS':
        return cartProductIds.includes(rule.value);

      case 'NOT_EQUALS':
        return !cartProductIds.includes(rule.value);

      case 'IN': {
        /** Lista de IDs separados por coma del valor de la regla */
        const targetIds = rule.value.split(',').map((id) => id.trim());
        return cartProductIds.some((id) => targetIds.includes(id));
      }

      case 'NOT_IN': {
        /** Lista de IDs separados por coma del valor de la regla */
        const excludedIds = rule.value.split(',').map((id) => id.trim());
        return !cartProductIds.some((id) => excludedIds.includes(id));
      }

      default:
        return false;
    }
  }
}
