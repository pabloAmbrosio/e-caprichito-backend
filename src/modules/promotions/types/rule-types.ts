/**
 * Tipos discriminados para reglas de promoción (Discriminated Unions)
 *
 * Cada tipo de regla (RuleType) tiene un conjunto específico de operadores
 * de comparación (ComparisonOperator) válidos. Esto previene combinaciones
 * inválidas en tiempo de compilación.
 *
 * Ejemplo: una regla CART_MIN_TOTAL solo acepta operadores numéricos
 * (GREATER_THAN, LESS_THAN, etc.), no operadores de lista (IN, NOT_IN).
 *
 * Se usa el patrón "discriminated union" donde el campo `type` actúa como
 * discriminante, permitiendo a TypeScript inferir automáticamente los
 * operadores válidos según el tipo seleccionado.
 */

/** Operadores válidos para comparaciones de igualdad y pertenencia a lista */
type EqualityOperator = 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN';

/** Operadores válidos para comparaciones numéricas (totales, cantidades) */
type NumericOperator = 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_OR_EQUAL' | 'LESS_OR_EQUAL' | 'EQUALS';

/**
 * Regla de producto: evalúa si un producto específico está en el carrito.
 * El campo `value` contiene el ID del producto (o IDs separados por coma para IN/NOT_IN).
 * Ejemplo: { type: 'PRODUCT', operator: 'IN', value: 'uuid1,uuid2' }
 */
export interface ProductRule {
  readonly type: 'PRODUCT';
  readonly operator: EqualityOperator;
  readonly value: string;
}

/**
 * Regla de categoría: evalúa si algún producto del carrito pertenece a una categoría.
 * El campo `value` contiene el categoryId (UUID) de la categoría
 * o varios categoryIds separados por coma para IN/NOT_IN.
 * Ejemplo: { type: 'CATEGORY', operator: 'EQUALS', value: 'uuid-de-categoria' }
 */
export interface CategoryRule {
  readonly type: 'CATEGORY';
  readonly operator: EqualityOperator;
  readonly value: string;
}

/**
 * Regla de tag: evalúa si algún producto del carrito tiene un tag específico.
 * El campo `value` contiene el tag a buscar (o tags separados por coma).
 * Ejemplo: { type: 'TAG', operator: 'IN', value: 'verano,casual' }
 */
export interface TagRule {
  readonly type: 'TAG';
  readonly operator: EqualityOperator;
  readonly value: string;
}

/**
 * Regla de total mínimo del carrito: evalúa si el monto total cumple un umbral.
 * El campo `value` contiene el monto como string numérico.
 * Ejemplo: { type: 'CART_MIN_TOTAL', operator: 'GREATER_OR_EQUAL', value: '100' }
 */
export interface CartMinTotalRule {
  readonly type: 'CART_MIN_TOTAL';
  readonly operator: NumericOperator;
  readonly value: string;
}

/**
 * Regla de cantidad mínima de items: evalúa el número total de items en el carrito.
 * El campo `value` contiene la cantidad como string numérico.
 * Ejemplo: { type: 'CART_MIN_QUANTITY', operator: 'GREATER_OR_EQUAL', value: '3' }
 */
export interface CartMinQuantityRule {
  readonly type: 'CART_MIN_QUANTITY';
  readonly operator: NumericOperator;
  readonly value: string;
}

/**
 * Regla de rol del cliente: evalúa el nivel VIP del cliente.
 * El campo `value` contiene el customerRole (MEMBER, VIP_FAN, VIP_LOVER, VIP_LEGEND)
 * o varios separados por coma para IN.
 * Ejemplo: { type: 'CUSTOMER_ROLE', operator: 'IN', value: 'VIP_LOVER,VIP_LEGEND' }
 */
export interface CustomerRoleRule {
  readonly type: 'CUSTOMER_ROLE';
  readonly operator: EqualityOperator;
  readonly value: string;
}

/**
 * Regla de primera compra: evalúa si es la primera orden del cliente.
 * El campo `value` contiene "true" (aplica si es primera compra) o "false" (si no lo es).
 * Solo usa EQUALS como operador.
 * Ejemplo: { type: 'FIRST_PURCHASE', operator: 'EQUALS', value: 'true' }
 */
export interface FirstPurchaseRule {
  readonly type: 'FIRST_PURCHASE';
  readonly operator: 'EQUALS';
  readonly value: string;
}

/**
 * Unión discriminada de todos los tipos de regla.
 * TypeScript puede inferir el tipo exacto basándose en el campo `type`.
 *
 * Ejemplo de uso:
 * ```typescript
 * function processRule(rule: TypedPromotionRule) {
 *   if (rule.type === 'CART_MIN_TOTAL') {
 *     // TypeScript sabe que rule.operator es NumericOperator aquí
 *   }
 * }
 * ```
 */
export type TypedPromotionRule =
  | ProductRule
  | CategoryRule
  | TagRule
  | CartMinTotalRule
  | CartMinQuantityRule
  | CustomerRoleRule
  | FirstPurchaseRule;

/**
 * Mapped type que asocia cada valor de RuleType con su interfaz tipada correspondiente.
 * Útil para construir registros type-safe donde se necesita mapear tipo → implementación.
 *
 * Ejemplo de uso:
 * ```typescript
 * // Cada evaluador está tipado con la regla correcta
 * type EvaluatorRegistry = {
 *   [K in keyof RuleTypeMap]: IRuleEvaluator<RuleTypeMap[K]>;
 * };
 * ```
 */
export type RuleTypeMap = {
  PRODUCT: ProductRule;
  CATEGORY: CategoryRule;
  TAG: TagRule;
  CART_MIN_TOTAL: CartMinTotalRule;
  CART_MIN_QUANTITY: CartMinQuantityRule;
  CUSTOMER_ROLE: CustomerRoleRule;
  FIRST_PURCHASE: FirstPurchaseRule;
};
