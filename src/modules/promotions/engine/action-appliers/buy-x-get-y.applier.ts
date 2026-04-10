/**
 * Aplicador de acción BUY_X_GET_Y (NxM).
 *
 * Implementa la lógica "compra X, lleva Y gratis". El campo `value` contiene
 * la relación como "compra:gratis" (ej: "2:1" para 2x1, "3:1" para 3x2).
 *
 * Algoritmo:
 * 1. Parsear "X:Y" del value
 * 2. Contar cuántos "sets" completos (X+Y) hay en el carrito
 * 3. Los Y items más baratos de cada set son gratis
 * 4. El descuento es la suma de los precios de los items gratis
 *
 * Ejemplo: 2x1 (compra 2 lleva 1 gratis), carrito con items de 10000, 8000, 5000 centavos
 * - Un set completo de 3 items (2+1), Y=1 item gratis
 * - El más barato del set es 5000 centavos ($50) → descuento = 5000
 */
import type { IActionApplier } from './action-applier.interface';
import type { BuyXGetYAction } from '../../types';
import type { PromotionContext } from '../../types';

export class BuyXGetYApplier implements IActionApplier<BuyXGetYAction> {
  /**
   * Calcula el monto de descuento por items gratis (NxM).
   *
   * @param action - Acción con value "X:Y" (ej: "2:1")
   * @param context - Contexto con items del carrito
   * @param currentTotal - Total actual del carrito en centavos
   * @returns Monto de descuento en centavos (precio de los items gratis)
   */
  apply(action: BuyXGetYAction, context: PromotionContext, currentTotal: number): number {
    /** Parsear la relación "compra:gratis" del value */
    const parsed = this.parseValue(action.value);
    if (!parsed) return 0;

    const { buyCount, freeCount } = parsed;

    /** Expandir los items del carrito según su cantidad (1 item con qty 3 = 3 entries) */
    const expandedPrices = this.expandCartItemPrices(context);

    /** Tamaño de un "set" completo (ej: 2+1=3 para un 2x1) */
    const setSize = buyCount + freeCount;

    /** Cuántos sets completos se pueden formar */
    const completeSets = Math.floor(expandedPrices.length / setSize);
    if (completeSets === 0) return 0;

    /**
     * Ordenar precios de menor a mayor.
     * Los items más baratos serán los que salgan gratis (beneficio para el negocio).
     */
    const sortedPrices = [...expandedPrices].sort((a, b) => a - b);

    /** Calcular descuento: los Y items más baratos de cada set son gratis */
    let discount = 0;
    const totalFreeItems = completeSets * freeCount;
    for (let i = 0; i < totalFreeItems && i < sortedPrices.length; i++) {
      discount += sortedPrices[i];
    }

    /** Asegurar que el descuento nunca exceda el total actual */
    return Math.min(Math.max(discount, 0), currentTotal);
  }

  /**
   * Parsea el valor "X:Y" en sus componentes numéricos.
   * Retorna null si el formato es inválido.
   *
   * @param value - String en formato "compra:gratis" (ej: "2:1")
   * @returns Objeto con buyCount y freeCount, o null si es inválido
   */
  private parseValue(value: string): { buyCount: number; freeCount: number } | null {
    const parts = value.split(':');
    if (parts.length !== 2) return null;

    const buyCount = parseInt(parts[0], 10);
    const freeCount = parseInt(parts[1], 10);

    if (isNaN(buyCount) || isNaN(freeCount) || buyCount < 1 || freeCount < 1) {
      return null;
    }

    return { buyCount, freeCount };
  }

  /**
   * Expande los items del carrito: un item con quantity=3 y priceInCents=10000
   * se convierte en [10000, 10000, 10000]. Esto permite calcular los "sets"
   * de NxM correctamente item por item.
   *
   * #10 [CRITICO]: Límite máximo de expansión para prevenir ataques de denegación
   * de servicio (DoS) donde un carrito con cantidades enormes podría causar un
   * array masivo que agote la memoria del servidor. El límite por defecto es 1000 items.
   *
   * @param context - Contexto con los items del carrito
   * @returns Array de precios individuales expandidos por cantidad (máximo MAX_EXPANSION_LIMIT)
   */
  private expandCartItemPrices(context: PromotionContext): number[] {
    /** Límite máximo de items expandidos para prevenir DoS */
    const MAX_EXPANSION_LIMIT = 1000;

    const prices: number[] = [];
    for (const item of context.cartItems) {
      for (let i = 0; i < item.quantity; i++) {
        if (prices.length >= MAX_EXPANSION_LIMIT) {
          return prices;
        }
        prices.push(item.priceInCents);
      }
    }
    return prices;
  }
}
