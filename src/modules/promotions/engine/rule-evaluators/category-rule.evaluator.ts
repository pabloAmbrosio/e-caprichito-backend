/**
 * Evaluador de reglas de tipo CATEGORY.
 *
 * Evalúa si algún producto del carrito pertenece a la categoría especificada.
 * El campo `value` contiene el categoryId (UUID) de la categoría
 * o varios categoryIds separados por coma para IN/NOT_IN.
 *
 * Operadores soportados:
 * - EQUALS: algún item tiene exactamente esa categoría
 * - NOT_EQUALS: ningún item tiene esa categoría
 * - IN: algún item tiene una categoría de la lista
 * - NOT_IN: ningún item tiene una categoría de la lista
 */
import type { IRuleEvaluator } from './rule-evaluator.interface';
import type { CategoryRule } from '../../types';
import type { PromotionContext } from '../../types';

export class CategoryRuleEvaluator implements IRuleEvaluator<CategoryRule> {
  /**
   * Evalúa si algún producto del carrito pertenece a la categoría de la regla.
   *
   * @param rule - Regla con type='CATEGORY', operador y valor (categoryId o lista de categoryIds)
   * @param context - Contexto con los items del carrito y sus categoryIds
   * @returns true si la condición de categoría se cumple
   */
  evaluate(rule: CategoryRule, context: PromotionContext): boolean {
    /** categoryIds de los productos en el carrito */
    const cartCategoryIds = context.cartItems.map((item) => item.categoryId);

    switch (rule.operator) {
      case 'EQUALS':
        return cartCategoryIds.includes(rule.value);

      case 'NOT_EQUALS':
        return !cartCategoryIds.includes(rule.value);

      case 'IN': {
        /** Lista de categoryIds válidos separados por coma */
        const targetCategoryIds = rule.value.split(',').map((c) => c.trim());
        return cartCategoryIds.some((catId) => targetCategoryIds.includes(catId));
      }

      case 'NOT_IN': {
        /** Lista de categoryIds excluidos separados por coma */
        const excludedCategoryIds = rule.value.split(',').map((c) => c.trim());
        return !cartCategoryIds.some((catId) => excludedCategoryIds.includes(catId));
      }

      default:
        return false;
    }
  }
}
