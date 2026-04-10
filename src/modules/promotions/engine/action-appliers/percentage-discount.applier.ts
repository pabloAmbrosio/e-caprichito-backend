/**
 * Aplicador de acción PERCENTAGE_DISCOUNT.
 *
 * Calcula un descuento porcentual sobre el total, un producto específico,
 * o el item más barato del carrito, según el campo `target`.
 *
 * Ejemplo: 20% de descuento en el carrito con máximo 5000 centavos ($50)
 * - value: "20", maxDiscountInCents: 5000, target: "CART"
 * - Si el carrito vale 30000 centavos ($300), descuento = min(6000, 5000) = 5000
 */
import type { IActionApplier } from './action-applier.interface';
import type { PercentageDiscountAction } from '../../types';
import type { PromotionContext } from '../../types';

export class PercentageDiscountApplier implements IActionApplier<PercentageDiscountAction> {
  /**
   * Calcula el monto de descuento porcentual.
   *
   * @param action - Acción con porcentaje, maxDiscountInCents opcional y target
   * @param context - Contexto con items del carrito
   * @param currentTotal - Total actual del carrito en centavos
   * @returns Monto de descuento en centavos (siempre >= 0 y <= currentTotal)
   */
  apply(action: PercentageDiscountAction, context: PromotionContext, currentTotal: number): number {
    /** Porcentaje a aplicar (ej: 20 para 20%) */
    const percentage = parseFloat(action.value);
    if (isNaN(percentage) || percentage <= 0) return 0;

    /** Base sobre la cual calcular el descuento, según el target */
    let baseAmount: number;

    switch (action.target) {
      case 'CART':
        /** Descuento sobre el total actual del carrito */
        baseAmount = currentTotal;
        break;

      case 'CHEAPEST_ITEM': {
        /** Descuento sobre el precio del item más barato del carrito */
        const cheapest = this.findCheapestItem(context);
        baseAmount = cheapest;
        break;
      }

      case 'PRODUCT':
        /** Descuento sobre el total de los productos (= currentTotal en este contexto) */
        baseAmount = currentTotal;
        break;

      default:
        baseAmount = currentTotal;
    }

    /** Calcular descuento bruto y redondear a centavos */
    let discount = Math.round(baseAmount * (percentage / 100));

    /** Aplicar tope máximo si existe */
    if (action.maxDiscountInCents !== null && discount > action.maxDiscountInCents) {
      discount = action.maxDiscountInCents;
    }

    /** Asegurar que el descuento nunca exceda el total actual */
    return Math.min(Math.max(discount, 0), currentTotal);
  }

  /**
   * Encuentra el precio del item más barato del carrito.
   * Si el carrito está vacío, retorna 0.
   */
  private findCheapestItem(context: PromotionContext): number {
    if (context.cartItems.length === 0) return 0;
    return Math.min(...context.cartItems.map((item) => item.priceInCents));
  }
}
