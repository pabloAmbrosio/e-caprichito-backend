/**
 * Interfaz genérica para aplicadores de acciones de descuento.
 *
 * Cada tipo de acción (PERCENTAGE_DISCOUNT, FIXED_DISCOUNT, BUY_X_GET_Y) tiene
 * su propio aplicador que implementa esta interfaz. El engine usa polimorfismo
 * para calcular descuentos sin switch/case.
 *
 * @template TAction - Tipo discriminado de la acción (de TypedPromotionAction).
 *                     Garantiza type-safety: un PercentageDiscountApplier solo recibe
 *                     PercentageDiscountAction.
 */
import type { PromotionContext } from '../../types';

export interface IActionApplier<TAction> {
  /**
   * Calcula el monto de descuento que produce esta acción.
   *
   * @param action - La acción con su tipo, valor, maxDiscountInCents y target
   * @param context - Datos del carrito y usuario para calcular el descuento
   * @param currentTotal - Total actual del carrito en centavos (puede ser menor al original si hay promos acumuladas)
   * @returns El monto de descuento en centavos (siempre positivo, nunca mayor al currentTotal)
   */
  apply(action: TAction, context: PromotionContext, currentTotal: number): number;
}
