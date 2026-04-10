/**
 * Tipos para el Display Promotion Engine.
 *
 * A diferencia del PromotionEngine (orientado a carrito), el Display Engine
 * evalúa qué promociones son visibles a nivel de producto individual.
 *
 * Solo maneja promos cuyas acciones son mostrables sin contexto de carrito:
 * - PERCENTAGE_DISCOUNT con target PRODUCT
 * - BUY_X_GET_Y con target PRODUCT
 *
 * Y rules que permiten resolver qué productos afectan:
 * - PRODUCT, CATEGORY, TAG (apuntan a productos concretos)
 * - CUSTOMER_ROLE, FIRST_PURCHASE (globales condicionadas al comprador)
 */

/**
 * Producto en el formato mínimo que el display engine necesita para
 * determinar si una promoción le aplica.
 */
export interface ProductForDisplayEngine {
  /** ID de la variante (Product.id) */
  readonly productId: string;
  /** ID de la categoría del abstract product */
  readonly categoryId: string;
  /** Tags del abstract product */
  readonly tags: readonly string[];
  /** Precio unitario en centavos (para calcular descuento porcentual) */
  readonly priceInCents: number;
  /** Título del producto (para mostrar en resultados) */
  readonly title: string;
}

/**
 * Contexto del usuario para evaluar reglas globales (CUSTOMER_ROLE, FIRST_PURCHASE).
 * Todos los campos son opcionales porque el endpoint usa authenticateOptional.
 */
export interface DisplayUserContext {
  /** ID del usuario (null si no autenticado) */
  readonly userId: string | null;
  /** Rol VIP del usuario (null si no autenticado o no tiene) */
  readonly customerRole: string | null;
  /** Si es la primera compra (null si no autenticado — no se puede determinar) */
  readonly isFirstPurchase: boolean | null;
}

/**
 * Info visual de una promoción aplicable a un producto.
 * Contiene todo lo que el front necesita para renderizar badge/etiqueta,
 * precio tachado y precio final.
 */
export interface DisplayPromotion {
  /** ID de la promoción */
  readonly promotionId: string;
  /** Nombre de la promoción */
  readonly promotionName: string;
  /** Descripción de la promoción */
  readonly description: string | null;
  /** Tipo de acción (PERCENTAGE_DISCOUNT o BUY_X_GET_Y) */
  readonly actionType: 'PERCENTAGE_DISCOUNT' | 'BUY_X_GET_Y';
  /** Valor de la acción ("20" para 20%, "2:1" para 2x1) */
  readonly actionValue: string;
  /** Precio original del producto en centavos (sin descuento) */
  readonly originalPriceInCents: number;
  /** Descuento calculado en centavos (0 si no aplica cálculo directo, ej: BUY_X_GET_Y) */
  readonly discountAmountInCents: number;
  /** Precio final estimado en centavos (igual a original si no aplica cálculo directo) */
  readonly finalPriceInCents: number;
  /** Porcentaje de descuento (ej: 20 para 20%). Solo presente para PERCENTAGE_DISCOUNT */
  readonly discountPercentage: number | null;
  /** Campos visuales de la promoción */
  readonly display: {
    readonly badgeText: string | null;
    readonly badgeColor: string | null;
    readonly colorPrimary: string | null;
    readonly colorSecondary: string | null;
  };
}

/**
 * Resultado del display engine para un producto individual.
 */
export interface ProductDisplayResult {
  /** ID de la variante */
  readonly productId: string;
  /** Promociones aplicables a este producto */
  readonly promotions: readonly DisplayPromotion[];
}

/**
 * Resultado completo del display engine para un lote de productos.
 */
export interface DisplayEngineResult {
  /** Map de productId → promociones aplicables */
  readonly productPromotions: ReadonlyMap<string, readonly DisplayPromotion[]>;
}
