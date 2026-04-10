/**
 * Tipos discriminados para acciones de promoción (Discriminated Unions)
 *
 * Cada tipo de acción (ActionType) tiene una estructura específica para su `value`
 * y un tipo de resultado diferente. Se usa el patrón discriminated union con el
 * campo `type` como discriminante.
 *
 * Además, se define un Conditional Type (ActionResult<T>) que infiere
 * automáticamente el tipo de resultado según el tipo de acción, eliminando
 * la necesidad de casteos manuales.
 */

/**
 * Acción de descuento porcentual.
 * El campo `value` contiene el porcentaje como string (ej: "20" para 20%).
 * El campo `maxDiscountInCents` limita el monto máximo de descuento en centavos.
 * Ejemplo: 20% de descuento en el carrito, máximo 5000 centavos ($50)
 */
export interface PercentageDiscountAction {
  readonly type: 'PERCENTAGE_DISCOUNT';
  /** Porcentaje de descuento como string (ej: "20" para 20%) */
  readonly value: string;
  /** Tope máximo de descuento en centavos (null = sin tope) */
  readonly maxDiscountInCents: number | null;
  /** A qué se aplica: producto específico, carrito completo, o item más barato */
  readonly target: 'PRODUCT' | 'CART' | 'CHEAPEST_ITEM';
}

/**
 * Acción de descuento fijo (monto absoluto).
 * El campo `value` contiene el monto como string (ej: "50.00" para $50).
 * Ejemplo: $50 de descuento en el carrito
 */
export interface FixedDiscountAction {
  readonly type: 'FIXED_DISCOUNT';
  /** Monto fijo de descuento como string (ej: "50.00") */
  readonly value: string;
  /** Tope máximo de descuento en centavos (null = sin tope) */
  readonly maxDiscountInCents: number | null;
  /** A qué se aplica: producto específico, carrito completo, o item más barato */
  readonly target: 'PRODUCT' | 'CART' | 'CHEAPEST_ITEM';
}

/**
 * Accion de compra X lleva Y gratis (NxM).
 * El campo `value` contiene la relacion "compra:gratis" como string (ej: "2:1" para 2x1).
 * El descuento se calcula sobre los items mas baratos que califican.
 * Ejemplo: Compra 2, lleva 1 gratis -> value = "2:1"
 */
export interface BuyXGetYAction {
  readonly type: 'BUY_X_GET_Y';
  /** Relacion compra:gratis como string (ej: "2:1" para compra 2 lleva 1 gratis) */
  readonly value: string;
  /** Tope maximo de descuento en centavos (null = sin tope). No suele aplicar para BUY_X_GET_Y */
  readonly maxDiscountInCents: number | null;
  /** A que se aplica: generalmente PRODUCT o CHEAPEST_ITEM */
  readonly target: 'PRODUCT' | 'CART' | 'CHEAPEST_ITEM';
}

/**
 * Unión discriminada de todos los tipos de acción.
 * TypeScript infiere el tipo exacto basándose en el campo `type`.
 *
 * Ejemplo de uso:
 * ```typescript
 * function processAction(action: TypedPromotionAction) {
 *   if (action.type === 'PERCENTAGE_DISCOUNT') {
 *     const percentage = parseFloat(action.value); // TypeScript sabe que es PercentageDiscountAction
 *   }
 * }
 * ```
 */
export type TypedPromotionAction =
  | PercentageDiscountAction
  | FixedDiscountAction
  | BuyXGetYAction;


/**
 * Resultado monetario: descuento calculado como monto de dinero.
 * Usado por PERCENTAGE_DISCOUNT y FIXED_DISCOUNT.
 */
export interface MonetaryDiscountResult {
  /** Monto de descuento calculado en centavos */
  readonly discountAmountInCents: number;
}

/**
 * Resultado de items gratis: descuento calculado por items regalados.
 * Usado por BUY_X_GET_Y.
 */
export interface FreeItemDiscountResult {
  /** Monto de descuento calculado en centavos (precio de los items gratis) */
  readonly discountAmountInCents: number;
  /** Cantidad de items que salen gratis */
  readonly freeItems: number;
}

/**
 * Conditional Type que infiere automáticamente el tipo de resultado
 * según el tipo de acción. Elimina la necesidad de casteos manuales.
 *
 * Ejemplo de uso:
 * ```typescript
 * // result tiene tipo MonetaryDiscountResult automáticamente
 * const result: ActionResult<'PERCENTAGE_DISCOUNT'> = { discountAmountInCents: 2000 };
 *
 * // result tiene tipo FreeItemDiscountResult automáticamente
 * const result: ActionResult<'BUY_X_GET_Y'> = { discountAmountInCents: 5000, freeItems: 1 };
 * ```
 */
export type ActionResult<T extends TypedPromotionAction['type']> =
  T extends 'PERCENTAGE_DISCOUNT' ? MonetaryDiscountResult :
  T extends 'FIXED_DISCOUNT' ? MonetaryDiscountResult :
  T extends 'BUY_X_GET_Y' ? FreeItemDiscountResult :
  never;
