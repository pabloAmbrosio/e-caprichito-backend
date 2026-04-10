/**
 * Evaluador de reglas de tipo CUSTOMER_ROLE.
 *
 * Evalúa si el nivel VIP/lealtad del cliente cumple con la condición.
 * El campo `value` contiene el customerRole (MEMBER, VIP_FAN, VIP_LOVER, VIP_LEGEND)
 * o varios separados por coma para IN/NOT_IN.
 *
 * Operadores soportados:
 * - EQUALS: el customerRole del usuario es exactamente ese valor
 * - NOT_EQUALS: el customerRole del usuario NO es ese valor
 * - IN: el customerRole está en la lista de valores
 * - NOT_IN: el customerRole NO está en la lista de valores
 */
import type { IRuleEvaluator } from './rule-evaluator.interface';
import type { CustomerRoleRule } from '../../types';
import type { PromotionContext } from '../../types';

export class CustomerRoleEvaluator implements IRuleEvaluator<CustomerRoleRule> {
  /**
   * Evalúa si el customerRole del usuario cumple la condición de la regla.
   *
   * @param rule - Regla con type='CUSTOMER_ROLE', operador y valor (rol o lista)
   * @param context - Contexto con el customerRole del usuario
   * @returns true si el rol del cliente cumple la condición
   */
  evaluate(rule: CustomerRoleRule, context: PromotionContext): boolean {
    /**
     * #21 [MEDIO]: Manejo explicito de null/undefined para customerRole.
     * Usuarios administrativos (OWNER, ADMIN, MANAGER, SELLER) pueden tener
     * customerRole como null ya que no participan en el sistema de tiers VIP.
     * En ese caso, la regla CUSTOMER_ROLE no se cumple.
     */
    if (context.customerRole === null || context.customerRole === undefined) {
      return false;
    }

    switch (rule.operator) {
      case 'EQUALS':
        return context.customerRole === rule.value;

      case 'NOT_EQUALS':
        return context.customerRole !== rule.value;

      case 'IN': {
        /** Lista de roles válidos separados por coma */
        const targetRoles = rule.value.split(',').map((r) => r.trim());
        return targetRoles.includes(context.customerRole);
      }

      case 'NOT_IN': {
        /** Lista de roles excluidos separados por coma */
        const excludedRoles = rule.value.split(',').map((r) => r.trim());
        return !excludedRoles.includes(context.customerRole);
      }

      default:
        return false;
    }
  }
}
