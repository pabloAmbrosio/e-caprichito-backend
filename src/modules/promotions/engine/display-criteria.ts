/**
 * Criterios compartidos para determinar si una promoción es "displayable"
 * (mostrable a nivel de producto individual).
 *
 * Usados por:
 * - DisplayPromotionEngine (evalúa promos por producto en el listado)
 * - classify-promotion helper (clasifica promos para el endpoint de banners)
 */

/** Action types mostrables a nivel de producto individual */
export const DISPLAYABLE_ACTION_TYPES = ['PERCENTAGE_DISCOUNT', 'BUY_X_GET_Y'] as const;

/**
 * Action targets válidos para display.
 * PRODUCT y CART son matemáticamente idénticos en contexto simulado (1 item):
 * ambos usan currentTotal = priceInCents como base.
 * CHEAPEST_ITEM se excluye porque requiere múltiples items para comparar.
 */
export const DISPLAYABLE_ACTION_TARGETS = ['PRODUCT', 'CART'] as const;

/** Rule types que apuntan directamente a productos */
export const PRODUCT_TARGETING_RULES: ReadonlySet<string> = new Set(['PRODUCT', 'CATEGORY', 'TAG']);

/** Rule types que son condiciones globales del comprador */
export const BUYER_CONDITION_RULES: ReadonlySet<string> = new Set(['CUSTOMER_ROLE', 'FIRST_PURCHASE']);
