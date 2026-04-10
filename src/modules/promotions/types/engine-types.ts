/**
 * Tipos para el motor de evaluación de promociones (Promotion Engine)
 *
 * Define las interfaces que el engine usa para recibir contexto (datos del carrito,
 * usuario, etc.) y devolver resultados (descuentos calculados, promos aplicadas).
 *
 * Estos tipos son la interfaz pública del engine: cualquier código que interactúe
 * con el motor de promociones usa estos tipos.
 */

/**
 * Item del carrito en el formato que el engine necesita para evaluar reglas.
 * Es una vista simplificada del CartItem + Product + AbstractProduct de Prisma,
 * con solo los campos necesarios para evaluación.
 */
export interface CartItemForEngine {
  /** ID único del producto (variante) */
  readonly productId: string;
  /** ID de la categoría del producto base (UUID referenciando la tabla Category) */
  readonly categoryId: string;
  /** Tags del producto base (ej: ["verano", "casual"]) */
  readonly tags: readonly string[];
  /** Precio unitario del producto en centavos */
  readonly priceInCents: number;
  /** Cantidad de este producto en el carrito */
  readonly quantity: number;
  /** Nombre/título del producto para mostrar en resultados */
  readonly title: string;
}

/**
 * Contexto de evaluación: todos los datos que el engine necesita para evaluar
 * qué promociones aplican y calcular los descuentos.
 *
 * Este contexto se construye una vez antes de llamar al engine y se pasa
 * a todos los evaluadores de reglas y aplicadores de acciones.
 */
export interface PromotionContext {
  /** ID del usuario que está comprando */
  readonly userId: string;
  /** Rol de cliente/VIP del usuario (MEMBER, VIP_FAN, etc.) o null si no tiene */
  readonly customerRole: string | null;
  /** Items del carrito con la información necesaria para evaluación */
  readonly cartItems: readonly CartItemForEngine[];
  /** Total del carrito en centavos (suma de priceInCents * quantity de todos los items) */
  readonly cartTotalInCents: number;
  /** Código de cupón ingresado por el cliente (undefined si no ingresó ninguno) */
  readonly couponCode?: string;
  /** Si es la primera compra del usuario (pre-computado antes de evaluar) */
  readonly isFirstPurchase: boolean;
}

/**
 * Detalle de una promoción que fue aplicada exitosamente.
 * El engine retorna un array de estos objetos dentro de EngineResult.
 */
export interface AppliedPromotion {
  /** ID de la promoción en la base de datos */
  readonly promotionId: string;
  /** Nombre de la promoción (para mostrar al usuario) */
  readonly promotionName: string;
  /** Monto de descuento en centavos que generó esta promoción */
  readonly discountAmountInCents: number;
  /** Tipo de acción que se aplicó (PERCENTAGE_DISCOUNT, FIXED_DISCOUNT, BUY_X_GET_Y) */
  readonly actionType: string;
}

/**
 * Resultado final del motor de evaluación de promociones.
 * Contiene el resumen completo de descuentos aplicados al carrito.
 *
 * Ejemplo de resultado:
 * ```typescript
 * {
 *   originalTotalInCents: 20000,
 *   finalTotalInCents: 16000,
 *   totalDiscountInCents: 4000,
 *   appliedPromotions: [
 *     { promotionId: 'abc', promotionName: 'VIP 20%', discountAmountInCents: 4000, actionType: 'PERCENTAGE_DISCOUNT' }
 *   ]
 * }
 * ```
 */
export interface EngineResult {
  /** Total original del carrito en centavos antes de descuentos */
  readonly originalTotalInCents: number;
  /** Total final en centavos después de aplicar todos los descuentos */
  readonly finalTotalInCents: number;
  /** Suma total en centavos de todos los descuentos aplicados */
  readonly totalDiscountInCents: number;
  /** Detalle de cada promoción que fue aplicada */
  readonly appliedPromotions: readonly AppliedPromotion[];
}
