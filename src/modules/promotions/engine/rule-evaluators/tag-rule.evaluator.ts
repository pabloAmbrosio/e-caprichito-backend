/**
 * Evaluador de reglas de tipo TAG.
 *
 * Evalúa si algún producto del carrito tiene un tag específico.
 * El campo `value` contiene el tag a buscar (o tags separados por coma).
 * Los tags se comparan en minúsculas para evitar problemas de case sensitivity.
 *
 * Operadores soportados:
 * - EQUALS: algún item tiene exactamente ese tag
 * - NOT_EQUALS: ningún item tiene ese tag
 * - IN: algún item tiene al menos uno de los tags de la lista
 * - NOT_IN: ningún item tiene ninguno de los tags de la lista
 */
import type { IRuleEvaluator } from './rule-evaluator.interface';
import type { TagRule } from '../../types';
import type { PromotionContext } from '../../types';

export class TagRuleEvaluator implements IRuleEvaluator<TagRule> {
  /**
   * Evalúa si algún producto del carrito tiene el tag especificado en la regla.
   *
   * @param rule - Regla con type='TAG', operador y valor (tag o lista de tags)
   * @param context - Contexto con los items del carrito y sus tags
   * @returns true si la condición de tag se cumple
   */
  evaluate(rule: TagRule, context: PromotionContext): boolean {
    /** Todos los tags de todos los productos del carrito, en minúsculas */
    const allCartTags = context.cartItems.flatMap((item) =>
      item.tags.map((tag) => tag.toLowerCase())
    );

    /** Valor de la regla normalizado a minúsculas */
    const ruleValue = rule.value.toLowerCase();

    switch (rule.operator) {
      case 'EQUALS':
        return allCartTags.includes(ruleValue);

      case 'NOT_EQUALS':
        return !allCartTags.includes(ruleValue);

      case 'IN': {
        /** Lista de tags válidos separados por coma, normalizados */
        const targetTags = ruleValue.split(',').map((t) => t.trim());
        return allCartTags.some((tag) => targetTags.includes(tag));
      }

      case 'NOT_IN': {
        /** Lista de tags excluidos separados por coma, normalizados */
        const excludedTags = ruleValue.split(',').map((t) => t.trim());
        return !allCartTags.some((tag) => excludedTags.includes(tag));
      }

      default:
        return false;
    }
  }
}
