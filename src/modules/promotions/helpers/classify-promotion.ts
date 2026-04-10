/**
 * Helpers para clasificar promociones en el endpoint de banners.
 *
 * Reutiliza los criterios del display engine (display-criteria.ts)
 * para determinar si una promo es "displayable" a nivel de producto.
 */
import type { Promotion, PromotionRule, PromotionAction } from '../../../lib/prisma';
import {
  DISPLAYABLE_ACTION_TYPES,
  DISPLAYABLE_ACTION_TARGETS,
  PRODUCT_TARGETING_RULES,
  BUYER_CONDITION_RULES,
} from '../engine/display-criteria';

type PromotionWithRelations = Promotion & {
  rules: PromotionRule[];
  actions: PromotionAction[];
};

/**
 * Determina si una promo es displayable a nivel de producto.
 * Mismos criterios que el DisplayPromotionEngine usa para filtrar.
 */
export function isDisplayablePromotion(promo: PromotionWithRelations): boolean {
  const hasDisplayableAction = promo.actions.some(
    (a) =>
      DISPLAYABLE_ACTION_TYPES.includes(a.type as typeof DISPLAYABLE_ACTION_TYPES[number]) &&
      DISPLAYABLE_ACTION_TARGETS.includes(a.target as typeof DISPLAYABLE_ACTION_TARGETS[number])
  );
  if (!hasDisplayableAction) return false;

  if (promo.rules.length === 0) return true;

  return promo.rules.some(
    (r) => PRODUCT_TARGETING_RULES.has(r.type) || BUYER_CONDITION_RULES.has(r.type)
  );
}

/** Filtros extraídos de las rules para construir links en el front */
export interface PromotionFilters {
  readonly categoryIds: string[];
  readonly tags: string[];
  readonly productIds: string[];
}

/** Extrae filtros de producto de las rules de una promo */
export function extractFilters(rules: PromotionRule[]): PromotionFilters {
  const categoryIds: string[] = [];
  const tags: string[] = [];
  const productIds: string[] = [];

  for (const rule of rules) {
    const values = rule.value.split(',').map((v) => v.trim());

    switch (rule.type) {
      case 'CATEGORY':
        categoryIds.push(...values);
        break;
      case 'TAG':
        tags.push(...values);
        break;
      case 'PRODUCT':
        productIds.push(...values);
        break;
    }
  }

  return { categoryIds, tags, productIds };
}

/** Extrae el requiredRole de la primera regla CUSTOMER_ROLE, o null */
export function extractRequiredRole(rules: PromotionRule[]): string | null {
  const roleRule = rules.find((r) => r.type === 'CUSTOMER_ROLE');
  return roleRule?.value ?? null;
}

/** Verifica si la promo es exclusiva para primera compra */
export function isFirstPurchaseOnly(rules: PromotionRule[]): boolean {
  return rules.some((r) => r.type === 'FIRST_PURCHASE' && r.value === 'true');
}

/** Obtiene la primera acción displayable de la promo */
export function getDisplayableAction(actions: PromotionAction[]): { type: string; value: string } | null {
  const action = actions.find(
    (a) =>
      DISPLAYABLE_ACTION_TYPES.includes(a.type as typeof DISPLAYABLE_ACTION_TYPES[number]) &&
      DISPLAYABLE_ACTION_TARGETS.includes(a.target as typeof DISPLAYABLE_ACTION_TARGETS[number])
  );
  return action ? { type: action.type, value: action.value } : null;
}
