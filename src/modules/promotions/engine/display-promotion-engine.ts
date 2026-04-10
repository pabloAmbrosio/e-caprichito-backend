/**
 * DisplayPromotionEngine - Motor de evaluación de promociones para display en productos.
 *
 * A diferencia del PromotionEngine (carrito), este engine:
 * 1. Solo fetchea promos automáticas (sin cupón) con actions mostrables
 * 2. Solo evalúa rules de producto (PRODUCT, CATEGORY, TAG) y globales (CUSTOMER_ROLE, FIRST_PURCHASE)
 * 3. Evalúa por producto individual, no como carrito
 * 4. Retorna info visual (badge, descuento calculado) para cada producto
 *
 * Flujo:
 * 1. Obtener promos elegibles con acciones mostrables
 * 2. Filtrar por límites de uso (si hay usuario autenticado)
 * 3. Resolver prioridad y stacking
 * 4. Para cada producto, evaluar qué promos aplican y calcular descuento visual
 */
import { db } from '../../../lib/prisma';
import type { Promotion, PromotionRule, PromotionAction } from '../../../lib/prisma';
import type {
  ProductForDisplayEngine,
  DisplayUserContext,
  DisplayPromotion,
  DisplayEngineResult,
} from '../types/display-engine-types';
import type { IRuleEvaluator } from './rule-evaluators/rule-evaluator.interface';
import type { RuleTypeMap, TypedPromotionRule } from '../types';
import { ProductRuleEvaluator } from './rule-evaluators/product-rule.evaluator';
import { CategoryRuleEvaluator } from './rule-evaluators/category-rule.evaluator';
import { TagRuleEvaluator } from './rule-evaluators/tag-rule.evaluator';
import { CustomerRoleEvaluator } from './rule-evaluators/customer-role.evaluator';
import { FirstPurchaseEvaluator } from './rule-evaluators/first-purchase.evaluator';
import { PromotionResolver } from './promotion-resolver';
import {
  DISPLAYABLE_ACTION_TYPES,
  DISPLAYABLE_ACTION_TARGETS,
  PRODUCT_TARGETING_RULES,
  BUYER_CONDITION_RULES,
} from './display-criteria';
import { getGracePeriod } from '../constants';
import type { PromotionContext } from '../types';

/** Rules que el display engine sabe evaluar */
type DisplayRuleType = 'PRODUCT' | 'CATEGORY' | 'TAG' | 'CUSTOMER_ROLE' | 'FIRST_PURCHASE';

/** Registry solo con los evaluadores que el display engine usa */
type DisplayRuleEvaluatorRegistry = {
  [K in DisplayRuleType]: IRuleEvaluator<RuleTypeMap[K]>;
};

type DisplayablePromotion = Promotion & {
  rules: PromotionRule[];
  actions: PromotionAction[];
};

export class DisplayPromotionEngine {
  private readonly ruleEvaluators: DisplayRuleEvaluatorRegistry = {
    PRODUCT: new ProductRuleEvaluator(),
    CATEGORY: new CategoryRuleEvaluator(),
    TAG: new TagRuleEvaluator(),
    CUSTOMER_ROLE: new CustomerRoleEvaluator(),
    FIRST_PURCHASE: new FirstPurchaseEvaluator(),
  };

  private readonly resolver = new PromotionResolver();

  /**
   * Evalúa qué promociones mostrables aplican a cada producto del lote.
   *
   * @param products - Productos a evaluar (típicamente el resultado paginado del search engine)
   * @param userContext - Contexto del usuario (puede ser null/parcial si no autenticado)
   * @returns Map de productId → promociones aplicables con info visual
   */
  async evaluate(
    products: readonly ProductForDisplayEngine[],
    userContext: DisplayUserContext
  ): Promise<DisplayEngineResult> {
    if (products.length === 0) {
      return { productPromotions: new Map() };
    }

    // 1. Obtener promos elegibles con acciones mostrables
    const eligiblePromotions = await this.getDisplayablePromotions();

  
   

    if (eligiblePromotions.length === 0) {
      return { productPromotions: new Map() };
    }

    // 2. Filtrar por límites de uso (solo si hay usuario autenticado)
    const withinLimits = userContext.userId
      ? await this.filterByUsageLimits(eligiblePromotions, userContext.userId)
      : eligiblePromotions;

    if (withinLimits.length === 0) {
      return { productPromotions: new Map() };
    }

    // 3. Resolver prioridad y stacking
    const resolvedPromotions = this.resolver.resolve(withinLimits);
     

    // 4. Para cada producto, evaluar qué promos aplican
    const productPromotions = new Map<string, readonly DisplayPromotion[]>();

    for (const product of products) {

      const applicablePromos = this.evaluateForProduct(resolvedPromotions, product, userContext);


      if (applicablePromos.length > 0) {
        productPromotions.set(product.productId, applicablePromos);
      }
    }

    return { productPromotions };
  }

  // ─── QUERIES ─────────────────────────────────────────────────

  /**
   * Obtiene promos activas, automáticas (sin cupón), con al menos una action mostrable.
   * Una action es mostrable si: type ∈ {PERCENTAGE_DISCOUNT, BUY_X_GET_Y} AND target ∈ {PRODUCT, CART}
   * Y la promo tiene al menos una rule que apunta a productos (PRODUCT, CATEGORY, TAG)
   * o es una condición global (CUSTOMER_ROLE, FIRST_PURCHASE).
   */
  private async getDisplayablePromotions(): Promise<DisplayablePromotion[]> {
    const now = new Date();
    const gracePeriodMinutes = getGracePeriod();
    const effectiveNow = new Date(now.getTime() - gracePeriodMinutes * 60 * 1000);

    const promotions = await db.promotion.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        couponCode: null,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: effectiveNow } }],
        actions: {
          some: {
            type: { in: [...DISPLAYABLE_ACTION_TYPES] },
            target: { in: [...DISPLAYABLE_ACTION_TARGETS] },
          },
        },
      },
      include: { rules: true, actions: true },
      orderBy: { priority: 'desc' },
    });

    // Filtrar en memoria: la promo debe tener al least una rule
    // que sea de tipo producto-targeting o buyer-condition
    return promotions.filter((promo) => {
      if (promo.rules.length === 0) return true; // Sin reglas = aplica a todo



      return promo.rules.some(
        (rule) => PRODUCT_TARGETING_RULES.has(rule.type) || BUYER_CONDITION_RULES.has(rule.type)
      );
    });
  }

  /**
   * Filtra promos que el usuario ya alcanzó su límite de uso.
   * Reutiliza el mismo patrón batch del PromotionEngine.
   */
  private async filterByUsageLimits(
    promotions: DisplayablePromotion[],
    userId: string
  ): Promise<DisplayablePromotion[]> {
    const promosWithLimits = promotions.filter((p) => p.maxUsesPerUser !== null);

    if (promosWithLimits.length === 0) return promotions;

    const promoIdsWithLimits = promosWithLimits.map((p) => p.id);
    const usageCounts = await db.promotionUsage.groupBy({
      by: ['promotionId'],
      where: { userId, promotionId: { in: promoIdsWithLimits } },
      _count: { promotionId: true },
    });

    const usageMap = new Map<string, number>();
    for (const usage of usageCounts) {
      usageMap.set(usage.promotionId, usage._count.promotionId);
    }

    return promotions.filter((promo) => {
      if (promo.maxUsesPerUser === null) return true;
      return (usageMap.get(promo.id) ?? 0) < promo.maxUsesPerUser;
    });
  }

  // ─── EVALUACIÓN POR PRODUCTO ───────────────────────────────

  /**
   * Evalúa qué promos aplican a un producto individual.
   *
   * Para cada promo:
   * 1. Filtra sus rules a las que el display engine soporta
   * 2. Evalúa cada rule creando un contexto simulado de 1 producto
   * 3. Si las rules pasan (según ruleOperator ALL/ANY), la promo aplica
   * 4. Calcula el descuento visual y construye el DisplayPromotion
   */
  private evaluateForProduct(
    promotions: DisplayablePromotion[],
    product: ProductForDisplayEngine,
    userContext: DisplayUserContext
  ): DisplayPromotion[] {
    // Contexto simulado: el producto como si fuera un carrito de 1 item
    const simulatedContext: PromotionContext = {
      userId: userContext.userId ?? '',
      customerRole: userContext.customerRole,
      cartItems: [
        {
          productId: product.productId,
          categoryId: product.categoryId,
          tags: product.tags,
          priceInCents: product.priceInCents,
          quantity: 1,
          title: product.title,
        },
      ],
      cartTotalInCents: product.priceInCents,
      isFirstPurchase: userContext.isFirstPurchase ?? false,
    };

    const result: DisplayPromotion[] = [];

    for (const promo of promotions) {
      // Filtrar rules a las que el display engine soporta
      const displayRules = promo.rules.filter(
        (rule) => PRODUCT_TARGETING_RULES.has(rule.type) || BUYER_CONDITION_RULES.has(rule.type)
      );

      // Evaluar rules
      const rulesPass = this.evaluateDisplayRules(displayRules, promo.ruleOperator, simulatedContext);
      if (!rulesPass) continue;

      // Filtrar actions mostrables
      const displayActions = promo.actions.filter(
        (action) =>
          DISPLAYABLE_ACTION_TYPES.includes(action.type as typeof DISPLAYABLE_ACTION_TYPES[number]) &&
          DISPLAYABLE_ACTION_TARGETS.includes(action.target as typeof DISPLAYABLE_ACTION_TARGETS[number])
      );

      // Construir DisplayPromotion por cada action mostrable
      for (const action of displayActions) {
        const displayPromo = this.buildDisplayPromotion(promo, action, product);
        result.push(displayPromo);
      }
    }

    return result;
  }

  /**
   * Evalúa un conjunto de rules del display engine contra el contexto simulado.
   */
  private evaluateDisplayRules(
    rules: PromotionRule[],
    ruleOperator: string,
    context: PromotionContext
  ): boolean {
    if (rules.length === 0) return true;

    const ruleResults = rules.map((rule) => {
      const evaluator = this.ruleEvaluators[rule.type as DisplayRuleType];
      if (!evaluator) return false;

      const typedRule = {
        type: rule.type,
        operator: rule.operator,
        value: rule.value,
      } as TypedPromotionRule;

      return (evaluator as IRuleEvaluator<TypedPromotionRule>).evaluate(typedRule, context);
    });

    return ruleOperator === 'ALL'
      ? ruleResults.every(Boolean)
      : ruleResults.some(Boolean);
  }

  // ─── CONSTRUCCIÓN DE RESULTADO ─────────────────────────────

  /**
   * Construye el objeto DisplayPromotion con info visual y descuento calculado.
   *
   * - PERCENTAGE_DISCOUNT: calcula descuento real, precio final y porcentaje.
   * - BUY_X_GET_Y: no se puede calcular descuento unitario, se deja en 0.
   */
  private buildDisplayPromotion(
    promo: DisplayablePromotion,
    action: PromotionAction,
    product: ProductForDisplayEngine
  ): DisplayPromotion {
    const originalPriceInCents = product.priceInCents;
    let discountAmountInCents = 0;
    let finalPriceInCents = originalPriceInCents;
    let discountPercentage: number | null = null;

    if (action.type === 'PERCENTAGE_DISCOUNT') {
      const percentage = parseFloat(action.value);
      if (!isNaN(percentage) && percentage > 0) {
        let discount = Math.round(originalPriceInCents * (percentage / 100));

        // Aplicar tope máximo si existe
        if (action.maxDiscountInCents !== null && discount > action.maxDiscountInCents) {
          discount = action.maxDiscountInCents;
        }

        discountAmountInCents = Math.min(discount, originalPriceInCents);
        finalPriceInCents = originalPriceInCents - discountAmountInCents;
        // Porcentaje real (puede diferir del nominal si hay tope)
        discountPercentage = Math.round((discountAmountInCents / originalPriceInCents) * 100);
      }
    }

    return {
      promotionId: promo.id,
      promotionName: promo.name,
      description: promo.description,
      actionType: action.type as 'PERCENTAGE_DISCOUNT' | 'BUY_X_GET_Y',
      actionValue: action.value,
      originalPriceInCents,
      discountAmountInCents,
      finalPriceInCents,
      discountPercentage,
      display: {
        badgeText: promo.badgeText,
        badgeColor: promo.badgeColor,
        colorPrimary: promo.colorPrimary,
        colorSecondary: promo.colorSecondary,
      },
    };
  }
}
