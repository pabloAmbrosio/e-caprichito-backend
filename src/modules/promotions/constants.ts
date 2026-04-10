/**
 * Constantes del módulo de Promociones
 *
 * Centraliza mensajes de error, configuración de paginación,
 * arrays de roles permitidos, URLs de rutas y valores válidos
 * para los enums de Prisma (usados en schemas Valibot).
 *
 * #4 [MEDIO]: Incluye función centralizada getGracePeriod() para evitar
 * duplicar la lógica de lectura de PROMOTION_GRACE_PERIOD_MINUTES.
 *
 * #8 [MEDIO]: Incluye función centralizada dollarsToCents() para conversión
 * consistente de dólares a centavos en todo el módulo.
 */

/**
 * #4 [MEDIO]: Grace period centralizado.
 * Retorna el margen de gracia en minutos para promociones expiradas.
 * Se lee de la variable de entorno PROMOTION_GRACE_PERIOD_MINUTES (default: 0).
 *
 * @returns Número de minutos de gracia después del fin de una promoción
 */
export const getGracePeriod = (): number => {
  return parseInt(process.env.PROMOTION_GRACE_PERIOD_MINUTES || '0', 10);
};

/**
 * #8 [MEDIO]: Conversión centralizada de dólares a centavos.
 * Convierte un monto en dólares (string o number) a centavos (entero).
 * Usa Math.round para evitar problemas de punto flotante.
 *
 * @param dollars - Monto en dólares (string numérico o number)
 * @returns Monto equivalente en centavos (entero), o NaN si el input es inválido
 *
 * @example
 * dollarsToCents('50.00') // 5000
 * dollarsToCents(19.99)   // 1999
 * dollarsToCents('abc')   // NaN
 */
export const dollarsToCents = (dollars: string | number): number => {
  const amount = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  return Math.round(amount * 100);
};

/** Mensajes de error estandarizados en español para el módulo de promociones */
export const ERROR_MESSAGES = {
  PROMOTION_NOT_FOUND: 'Promoción no encontrada',
  PROMOTION_ALREADY_DELETED: 'La promoción ya fue eliminada',
  PROMOTION_EXPIRED: 'La promoción ha expirado',
  PROMOTION_NOT_ACTIVE: 'La promoción no está activa',
  PROMOTION_NOT_STARTED: 'La promoción aún no ha comenzado',
  COUPON_NOT_FOUND: 'Cupón no encontrado o no válido',
  COUPON_ALREADY_EXISTS: 'Ya existe una promoción con ese código de cupón',
  MAX_USES_REACHED: 'Has alcanzado el límite de usos para esta promoción',
  RULE_NOT_FOUND: 'Regla no encontrada',
  ACTION_NOT_FOUND: 'Acción no encontrada',
  INVALID_PROMOTION_ID: 'ID de promoción inválido',
  PROMOTION_NO_ACTIONS: 'La promoción no tiene acciones configuradas',
  PROMOTION_NO_RULES: 'La promoción no tiene reglas configuradas',
  NO_PROMOTIONS_APPLICABLE: 'No hay promociones aplicables',
  INTERNAL_ERROR: 'Error interno del servidor',
} as const;

/** Configuración de paginación por defecto para listados de promociones */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

/** Roles administrativos que pueden gestionar promociones (crear, editar, eliminar) */
export const ROLES_CAN_MANAGE_PROMOTIONS = ['OWNER', 'ADMIN'] as const;

/** URLs base para las rutas de la API de promociones */
export const PROMOTION_URLS = {
  BASE: '/promotions',
  BY_ID: '/promotions/:id',
  RULES: '/promotions/:id/rules',
  RULE_BY_ID: '/promotions/:id/rules/:ruleId',
  ACTIONS: '/promotions/:id/actions',
  ACTION_BY_ID: '/promotions/:id/actions/:actionId',
  APPLY_COUPON: '/promotions/apply-coupon',
  BANNERS: '/promotions/banners',
} as const;

/**
 * Arrays de valores válidos para schemas de validación Valibot.
 * Corresponden 1:1 con los enums definidos en Prisma schema.
 * Se usan con v.picklist() para validar inputs de la API.
 */

/** Tipos de regla válidos para PromotionRule.type */
export const RULE_TYPES = [
  'PRODUCT',
  'CATEGORY',
  'TAG',
  'CART_MIN_TOTAL',
  'CART_MIN_QUANTITY',
  'CUSTOMER_ROLE',
  'FIRST_PURCHASE',
] as const;

/** Operadores de comparación válidos para PromotionRule.operator */
export const COMPARISON_OPERATORS = [
  'EQUALS',
  'NOT_EQUALS',
  'IN',
  'NOT_IN',
  'GREATER_THAN',
  'LESS_THAN',
  'GREATER_OR_EQUAL',
  'LESS_OR_EQUAL',
] as const;

/** Tipos de acción válidos para PromotionAction.type */
export const ACTION_TYPES = [
  'PERCENTAGE_DISCOUNT',
  'FIXED_DISCOUNT',
  'BUY_X_GET_Y',
] as const;

/** Targets de acción válidos para PromotionAction.target */
export const ACTION_TARGETS = [
  'PRODUCT',
  'CART',
  'CHEAPEST_ITEM',
] as const;

/** Operadores de regla válidos para Promotion.ruleOperator */
export const RULE_OPERATORS = [
  'ALL',
  'ANY',
] as const;
