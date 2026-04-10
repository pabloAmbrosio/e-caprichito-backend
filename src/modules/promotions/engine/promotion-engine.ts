/**
 * PromotionEngine - Motor principal de evaluación de promociones.
 *
 * Flujo completo:
 * 1. Obtiene promociones elegibles de la base de datos
 * 2. Verifica límites de uso por usuario
 * 3. Evalúa las reglas de cada promoción usando evaluadores específicos
 * 4. Resuelve prioridad y stacking con el PromotionResolver
 * 5. Aplica las acciones de descuento con los aplicadores
 * 6. Retorna el resultado con el detalle de descuentos
 */
import { db } from '../../../lib/prisma';
import type { Promotion, PromotionRule, PromotionAction } from '../../../lib/prisma';
import type { PromotionContext, EngineResult, AppliedPromotion } from '../types';
import type { IRuleEvaluator } from './rule-evaluators/rule-evaluator.interface';
import type { IActionApplier } from './action-appliers/action-applier.interface';
import type { RuleTypeMap, TypedPromotionRule, TypedPromotionAction } from '../types';
import { ProductRuleEvaluator } from './rule-evaluators/product-rule.evaluator';
import { CategoryRuleEvaluator } from './rule-evaluators/category-rule.evaluator';
import { TagRuleEvaluator } from './rule-evaluators/tag-rule.evaluator';
import { CartMinTotalEvaluator } from './rule-evaluators/cart-min-total.evaluator';
import { CartMinQuantityEvaluator } from './rule-evaluators/cart-min-quantity.evaluator';
import { CustomerRoleEvaluator } from './rule-evaluators/customer-role.evaluator';
import { FirstPurchaseEvaluator } from './rule-evaluators/first-purchase.evaluator';
import { PercentageDiscountApplier } from './action-appliers/percentage-discount.applier';
import { FixedDiscountApplier } from './action-appliers/fixed-discount.applier';
import { BuyXGetYApplier } from './action-appliers/buy-x-get-y.applier';
import { PromotionResolver } from './promotion-resolver';
import { getGracePeriod } from '../constants';

/** Mapped Type: mapea cada RuleType a su evaluador concreto */
type RuleEvaluatorRegistry = {
  [K in keyof RuleTypeMap]: IRuleEvaluator<RuleTypeMap[K]>;
};

/** Mapped Type: mapea cada ActionType a su aplicador concreto */
type ActionApplierRegistry = {
  [K in TypedPromotionAction['type']]: IActionApplier<Extract<TypedPromotionAction, { type: K }>>;
};

type PromotionWithRelations = Promotion & {
  rules: PromotionRule[];
  actions: PromotionAction[];
};

interface EngineLogger {
  info: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, ...args: unknown[]) => void;
}

const defaultLogger: EngineLogger = {
  info: (msg, ...args) => console.log(`[PromotionEngine] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[PromotionEngine] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[PromotionEngine] ${msg}`, ...args),
};

export class PromotionEngine {
  
  private readonly ruleEvaluators: RuleEvaluatorRegistry = {
    PRODUCT: new ProductRuleEvaluator(),
    CATEGORY: new CategoryRuleEvaluator(),
    TAG: new TagRuleEvaluator(),
    CART_MIN_TOTAL: new CartMinTotalEvaluator(),
    CART_MIN_QUANTITY: new CartMinQuantityEvaluator(),
    CUSTOMER_ROLE: new CustomerRoleEvaluator(),
    FIRST_PURCHASE: new FirstPurchaseEvaluator(),
  };

  private readonly actionAppliers: ActionApplierRegistry = {
    PERCENTAGE_DISCOUNT: new PercentageDiscountApplier(),
    FIXED_DISCOUNT: new FixedDiscountApplier(),
    BUY_X_GET_Y: new BuyXGetYApplier(),
  };

  private readonly resolver = new PromotionResolver();

  private readonly logger: EngineLogger;

  constructor(logger?: EngineLogger) {
    this.logger = logger ?? defaultLogger;
  }

  async evaluate(context: PromotionContext): Promise<EngineResult> {
    this.logger.info(
      `Iniciando evaluacion: usuario=${context.userId}, ` +
      `items=${context.cartItems.length}, total=${context.cartTotalInCents}c, ` +
      `cupon=${context.couponCode ?? 'ninguno'}`
    );

    const eligiblePromotions = await this.getEligiblePromotions(context.couponCode);
    this.logger.info(`Elegibles: ${eligiblePromotions.length}`);

    if (eligiblePromotions.length === 0) {
      return this.buildEmptyResult(context.cartTotalInCents);
    }

    const withinLimits = await this.filterByUsageLimits(eligiblePromotions, context.userId);
    this.logger.info(`Dentro de límites: ${withinLimits.length}/${eligiblePromotions.length}`);

    if (withinLimits.length === 0) {
      return this.buildEmptyResult(context.cartTotalInCents);
    }

    const passingPromotions = this.evaluateRules(withinLimits, context);
    this.logger.info(`Pasan reglas: ${passingPromotions.length}/${withinLimits.length}`);

    if (passingPromotions.length === 0) {
      return this.buildEmptyResult(context.cartTotalInCents);
    }

    const resolvedPromotions = this.resolver.resolve(passingPromotions);
    this.logger.info(
      `Resueltas: ${resolvedPromotions.length} [${resolvedPromotions.map((p) => p.name).join(', ')}]`
    );

    const result = this.applyActions(resolvedPromotions, context);
    this.logger.info(
      `Resultado: original=${result.originalTotalInCents}c, ` +
      `descuento=${result.totalDiscountInCents}c, final=${result.finalTotalInCents}c`
    );

    return result;
  }

  // ─── QUERIES ─────────────────────────────────────────────────

  private async getEligiblePromotions(couponCode?: string): Promise<PromotionWithRelations[]> {
    const now = new Date();
    const gracePeriodMinutes = getGracePeriod();
    const effectiveNow = new Date(now.getTime() - gracePeriodMinutes * 60 * 1000);

    const dateConditions = {
      deletedAt: null,
      isActive: true,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: effectiveNow } }],
    };

    if (couponCode) {
      return db.promotion.findMany({
        where: {
          AND: [
            dateConditions,
            { OR: [{ couponCode }, { couponCode: null }] },
          ],
        },
        include: { rules: true, actions: true },
        orderBy: { priority: 'desc' },
      });
    }

    return db.promotion.findMany({
      where: { ...dateConditions, couponCode: null },
      include: { rules: true, actions: true },
      orderBy: { priority: 'desc' },
    });
  }

  /**
   * Filtra promos que el usuario ya alcanzó su límite de uso.
   * Usa una sola query batch (groupBy) en vez de N+1 queries.
   */
  private async filterByUsageLimits(
    promotions: PromotionWithRelations[],
    userId: string
  ): Promise<PromotionWithRelations[]> {
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

  // ─── EVALUACIÓN DE REGLAS ────────────────────────────────────

  private evaluateRules(
    promotions: PromotionWithRelations[],
    context: PromotionContext
  ): PromotionWithRelations[] {
    return promotions.filter((promo) => {
      if (promo.actions.length === 0) return false;
      if (promo.rules.length === 0) return true;

      const ruleResults = promo.rules.map((rule: PromotionRule) => {
        const evaluator = this.ruleEvaluators[rule.type as keyof RuleEvaluatorRegistry];
        if (!evaluator) return false;

        const typedRule = {
          type: rule.type,
          operator: rule.operator,
          value: rule.value,
        } as TypedPromotionRule;

        return (evaluator as IRuleEvaluator<TypedPromotionRule>).evaluate(typedRule, context);
      });

      return promo.ruleOperator === 'ALL'
        ? ruleResults.every(Boolean)
        : ruleResults.some(Boolean);
    });
  }

  // ─── APLICACIÓN DE ACCIONES ──────────────────────────────────

  private applyActions(
    promotions: PromotionWithRelations[],
    context: PromotionContext
  ): EngineResult {
    let currentTotal = context.cartTotalInCents;
    let totalDiscount = 0;
    const appliedPromotions: AppliedPromotion[] = [];

    for (const promo of promotions) {
      let promoDiscount = 0;
      let lastActionType = '';

      for (const action of promo.actions) {
        const applier = this.actionAppliers[action.type as keyof ActionApplierRegistry];
        if (!applier) continue;

        /**
         * maxDiscountInCents ya viene como Int (centavos) desde la DB.
         * No se necesita conversión adicional.
         */
        const typedAction = {
          type: action.type,
          value: action.value,
          maxDiscountInCents: action.maxDiscountInCents ?? null,
          target: action.target,
        } as TypedPromotionAction;

        const discount = (applier as IActionApplier<TypedPromotionAction>).apply(
          typedAction,
          context,
          currentTotal
        );
        promoDiscount += discount;
        lastActionType = action.type;
      }

      if (promoDiscount > 0) {
        currentTotal -= promoDiscount;
        totalDiscount += promoDiscount;

        appliedPromotions.push({
          promotionId: promo.id,
          promotionName: promo.name,
          discountAmountInCents: promoDiscount,
          actionType: lastActionType,
        });
      }
    }

    /** Total final nunca negativo; ajustar descuento para consistencia */
    const flooredTotal = Math.max(0, currentTotal);
    const adjustedDiscount = context.cartTotalInCents - flooredTotal;

    return {
      originalTotalInCents: context.cartTotalInCents,
      finalTotalInCents: flooredTotal,
      totalDiscountInCents: adjustedDiscount,
      appliedPromotions,
    };
  }

  private buildEmptyResult(cartTotalInCents: number): EngineResult {
    return {
      originalTotalInCents: cartTotalInCents,
      finalTotalInCents: cartTotalInCents,
      totalDiscountInCents: 0,
      appliedPromotions: [],
    };
  }
}
