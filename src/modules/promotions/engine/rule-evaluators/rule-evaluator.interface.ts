/**
 * Interfaz genérica para evaluadores de reglas de promoción.
 *
 * Cada tipo de regla (PRODUCT, CATEGORY, TAG, etc.) tiene su propio evaluador
 * que implementa esta interfaz con su tipo específico de regla.
 *
 * El engine usa polimorfismo para evaluar cualquier regla sin switch/case:
 * simplemente llama `evaluator.evaluate(rule, context)` y cada implementación
 * sabe cómo evaluar su tipo de regla.
 *
 * @template TRule - Tipo discriminado de la regla (de RuleTypeMap).
 *                   Garantiza type-safety: un ProductRuleEvaluator solo recibe ProductRule.
 */
import type { PromotionContext } from '../../types';

export interface IRuleEvaluator<TRule> {
  /**
   * Evalúa si una regla se cumple dado el contexto actual del carrito/usuario.
   *
   * @param rule - La regla a evaluar con su tipo, operador y valor
   * @param context - Datos del carrito, usuario y productos para evaluar contra
   * @returns true si la regla se cumple, false si no
   */
  evaluate(rule: TRule, context: PromotionContext): boolean;
}
