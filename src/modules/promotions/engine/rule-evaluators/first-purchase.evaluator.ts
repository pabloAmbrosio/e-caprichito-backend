/**
 * Evaluador de reglas de tipo FIRST_PURCHASE.
 *
 * Evalúa si es la primera compra del cliente. El flag `isFirstPurchase`
 * se pre-computa en el engine (consultando órdenes previas) antes de
 * pasar a los evaluadores, para mantener los evaluadores síncronos y puros.
 *
 * El campo `value` contiene "true" (aplica si es primera compra)
 * o "false" (aplica si NO es primera compra).
 * Solo usa EQUALS como operador.
 */
import type { IRuleEvaluator } from './rule-evaluator.interface';
import type { FirstPurchaseRule } from '../../types';
import type { PromotionContext } from '../../types';

export class FirstPurchaseEvaluator implements IRuleEvaluator<FirstPurchaseRule> {
  /**
   * Evalúa si el flag de primera compra coincide con el valor de la regla.
   *
   * @param rule - Regla con type='FIRST_PURCHASE', operator='EQUALS', value="true"/"false"
   * @param context - Contexto con isFirstPurchase pre-computado
   * @returns true si la condición de primera compra se cumple
   */
  evaluate(rule: FirstPurchaseRule, context: PromotionContext): boolean {
    /** Convertir el string "true"/"false" a boolean */
    const requiresFirstPurchase = rule.value.toLowerCase() === 'true';

    /** Comparar si el estado real coincide con lo requerido */
    return context.isFirstPurchase === requiresFirstPurchase;
  }
}
