/**
 * Tipos generales del módulo de promociones
 *
 * Define tipos que se usan en los services y handlers para tipar
 * los resultados de Prisma y los parámetros de funciones.
 */

import type {
  Promotion,
  PromotionRule,
  PromotionAction,
  PromotionUsage,
} from '../../../lib/prisma';

/**
 * Promoción con todas sus relaciones cargadas (rules, actions, usages).
 * Este es el tipo que retorna el service cuando se hace un GET con includes.
 */
export type PromotionWithDetails = Promotion & {
  rules: PromotionRule[];
  actions: PromotionAction[];
};

/**
 * Promoción con relaciones y contador de usos.
 * Se usa en el listado de promociones para mostrar cuántas veces se ha usado.
 */
export type PromotionWithUsageCount = PromotionWithDetails & {
  _count: { usages: number };
};

/**
 * Usuario autenticado: datos mínimos extraídos del JWT que los services necesitan.
 * Reutiliza el patrón de backoffice/products.
 */
export interface AuthenticatedUser {
  /** ID del usuario autenticado */
  readonly userId: string;
  /** Rol administrativo del usuario (OWNER, ADMIN, MANAGER, SELLER, CUSTOMER) */
  readonly adminRole: string;
}

/**
 * Datos necesarios para registrar el uso de una promoción en una orden.
 * Se pasa al service recordUsage después de crear la orden exitosamente.
 */
export interface RecordUsageData {
  /** ID de la promoción que se usó */
  readonly promotionId: string;
  /** ID del usuario que usó la promoción */
  readonly userId: string;
  /** ID de la orden donde se aplicó */
  readonly orderId: string;
  /** Monto de descuento en centavos que generó */
  readonly discountAmountInCents: number;
}
