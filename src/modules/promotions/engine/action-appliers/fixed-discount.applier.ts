/**
 * Aplicador de acción FIXED_DISCOUNT.
 *
 * Resta un monto fijo del total, de un producto específico, o del item más barato.
 * El descuento nunca excede el total actual (no se crean montos negativos).
 *
 * Ejemplo: $50 de descuento en el carrito
 * - value: "50.00", target: "CART"
 * - El value se convierte a centavos: 5000
 * - Si el carrito vale 30000 centavos ($300), descuento = 5000 ($50)
 * - Si el carrito vale 3000 centavos ($30), descuento = 3000 (no puede exceder el total)
 */
import type { IActionApplier } from './action-applier.interface';
import type { FixedDiscountAction } from '../../types';
import type { PromotionContext } from '../../types';
import { dollarsToCents } from '../../constants';

export class FixedDiscountApplier implements IActionApplier<FixedDiscountAction> {
  /**
   * Calcula el monto de descuento fijo.
   *
   * @param action - Accion con monto fijo y target
   * @param context - Contexto con items del carrito
   * @param currentTotal - Total actual del carrito en centavos
   * @returns Monto de descuento en centavos (siempre >= 0 y <= currentTotal)
   */
  apply(action: FixedDiscountAction, context: PromotionContext, currentTotal: number): number {
    /** #8 [MEDIO]: Monto fijo convertido de dolares a centavos con funcion centralizada */
    const fixedAmountInCents = dollarsToCents(action.value);
    if (isNaN(fixedAmountInCents) || fixedAmountInCents <= 0) return 0;

    /** Base sobre la cual aplicar el descuento, según el target */
    let maxAllowedDiscount: number;

    switch (action.target) {
      case 'CART':
        /** Descuento directo del total del carrito */
        maxAllowedDiscount = currentTotal;
        break;

      case 'CHEAPEST_ITEM': {
        /** Descuento limitado al precio del item más barato */
        const cheapestPrice = this.findCheapestItemPrice(context);
        maxAllowedDiscount = cheapestPrice;
        break;
      }

      case 'PRODUCT':
        /** Descuento del total (mismo que CART en este contexto) */
        maxAllowedDiscount = currentTotal;
        break;

      default:
        maxAllowedDiscount = currentTotal;
    }

    /** El descuento es el mínimo entre el monto fijo y lo máximo permitido */
    let discount = Math.min(fixedAmountInCents, maxAllowedDiscount);

    /** Aplicar tope máximo adicional si existe */
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
  private findCheapestItemPrice(context: PromotionContext): number {
    if (context.cartItems.length === 0) return 0;
    return Math.min(...context.cartItems.map((item) => item.priceInCents));
  }
}
