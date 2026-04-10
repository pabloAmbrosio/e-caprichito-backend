import { describe, it, expect } from 'vitest';
import { TagRuleEvaluator } from '../engine/rule-evaluators/tag-rule.evaluator';
import { CartMinTotalEvaluator } from '../engine/rule-evaluators/cart-min-total.evaluator';
import { CartMinQuantityEvaluator } from '../engine/rule-evaluators/cart-min-quantity.evaluator';
import { FirstPurchaseEvaluator } from '../engine/rule-evaluators/first-purchase.evaluator';
import { CustomerRoleEvaluator } from '../engine/rule-evaluators/customer-role.evaluator';
import { PercentageDiscountApplier } from '../engine/action-appliers/percentage-discount.applier';
import { FixedDiscountApplier } from '../engine/action-appliers/fixed-discount.applier';
import { PromotionResolver } from '../engine/promotion-resolver';
import type { PromotionContext } from '../types';

// ─── HELPERS ───────────────────────────────────────────────────

function makeContext(overrides: Partial<PromotionContext> = {}): PromotionContext {
  return {
    userId: 'test-user',
    customerRole: 'MEMBER',
    cartItems: [
      { productId: 'p1', categoryId: 'cat1', tags: ['rosa', 'vestido', 'mujer'], priceInCents: 35000, quantity: 2, title: 'Vestido Rosa' },
      { productId: 'p2', categoryId: 'cat2', tags: ['azul', 'blusa'], priceInCents: 22000, quantity: 1, title: 'Blusa Azul' },
    ],
    cartTotalInCents: 92000, // 35000*2 + 22000
    isFirstPurchase: false,
    ...overrides,
  };
}

// ─── TAG EVALUATOR ─────────────────────────────────────────────

describe('TagRuleEvaluator', () => {
  const evaluator = new TagRuleEvaluator();

  it('EQUALS: encuentra tag existente', () => {
    const ctx = makeContext();
    expect(evaluator.evaluate({ type: 'TAG', operator: 'EQUALS', value: 'rosa' }, ctx)).toBe(true);
  });

  it('EQUALS: case insensitive', () => {
    const ctx = makeContext();
    expect(evaluator.evaluate({ type: 'TAG', operator: 'EQUALS', value: 'ROSA' }, ctx)).toBe(true);
  });

  it('EQUALS: tag inexistente', () => {
    const ctx = makeContext();
    expect(evaluator.evaluate({ type: 'TAG', operator: 'EQUALS', value: 'verde' }, ctx)).toBe(false);
  });

  it('IN: matchea si al menos uno está', () => {
    const ctx = makeContext();
    expect(evaluator.evaluate({ type: 'TAG', operator: 'IN', value: 'verde,rosa,negro' }, ctx)).toBe(true);
  });

  it('IN: ninguno matchea', () => {
    const ctx = makeContext();
    expect(evaluator.evaluate({ type: 'TAG', operator: 'IN', value: 'verde,negro' }, ctx)).toBe(false);
  });

  it('NOT_IN: ninguno en el carrito', () => {
    const ctx = makeContext();
    expect(evaluator.evaluate({ type: 'TAG', operator: 'NOT_IN', value: 'verde,negro' }, ctx)).toBe(true);
  });
});

// ─── CART MIN TOTAL EVALUATOR ──────────────────────────────────

describe('CartMinTotalEvaluator', () => {
  const evaluator = new CartMinTotalEvaluator();

  it('GREATER_OR_EQUAL: carrito $920 >= $299', () => {
    const ctx = makeContext(); // 92000 cents
    expect(evaluator.evaluate({ type: 'CART_MIN_TOTAL', operator: 'GREATER_OR_EQUAL', value: '299' }, ctx)).toBe(true);
  });

  it('GREATER_OR_EQUAL: carrito $920 >= $1000 → false', () => {
    const ctx = makeContext();
    expect(evaluator.evaluate({ type: 'CART_MIN_TOTAL', operator: 'GREATER_OR_EQUAL', value: '1000' }, ctx)).toBe(false);
  });

  it('EQUALS: umbral exacto', () => {
    const ctx = makeContext({ cartTotalInCents: 50000 });
    expect(evaluator.evaluate({ type: 'CART_MIN_TOTAL', operator: 'EQUALS', value: '500' }, ctx)).toBe(true);
  });

  it('LESS_THAN: carrito menor al umbral', () => {
    const ctx = makeContext({ cartTotalInCents: 10000 });
    expect(evaluator.evaluate({ type: 'CART_MIN_TOTAL', operator: 'LESS_THAN', value: '200' }, ctx)).toBe(true);
  });
});

// ─── CART MIN QUANTITY EVALUATOR ───────────────────────────────

describe('CartMinQuantityEvaluator', () => {
  const evaluator = new CartMinQuantityEvaluator();

  it('GREATER_OR_EQUAL: 3 items >= 3', () => {
    const ctx = makeContext(); // qty 2 + qty 1 = 3
    expect(evaluator.evaluate({ type: 'CART_MIN_QUANTITY', operator: 'GREATER_OR_EQUAL', value: '3' }, ctx)).toBe(true);
  });

  it('GREATER_OR_EQUAL: 3 items >= 5 → false', () => {
    const ctx = makeContext();
    expect(evaluator.evaluate({ type: 'CART_MIN_QUANTITY', operator: 'GREATER_OR_EQUAL', value: '5' }, ctx)).toBe(false);
  });

  it('EQUALS: cantidad exacta', () => {
    const ctx = makeContext();
    expect(evaluator.evaluate({ type: 'CART_MIN_QUANTITY', operator: 'EQUALS', value: '3' }, ctx)).toBe(true);
  });
});

// ─── FIRST PURCHASE EVALUATOR ──────────────────────────────────

describe('FirstPurchaseEvaluator', () => {
  const evaluator = new FirstPurchaseEvaluator();

  it('primera compra: regla "true" + isFirstPurchase=true → pasa', () => {
    const ctx = makeContext({ isFirstPurchase: true });
    expect(evaluator.evaluate({ type: 'FIRST_PURCHASE', operator: 'EQUALS', value: 'true' }, ctx)).toBe(true);
  });

  it('no es primera compra: regla "true" + isFirstPurchase=false → no pasa', () => {
    const ctx = makeContext({ isFirstPurchase: false });
    expect(evaluator.evaluate({ type: 'FIRST_PURCHASE', operator: 'EQUALS', value: 'true' }, ctx)).toBe(false);
  });

  it('regla "false" + isFirstPurchase=false → pasa (promo para recurrentes)', () => {
    const ctx = makeContext({ isFirstPurchase: false });
    expect(evaluator.evaluate({ type: 'FIRST_PURCHASE', operator: 'EQUALS', value: 'false' }, ctx)).toBe(true);
  });
});

// ─── CUSTOMER ROLE EVALUATOR ───────────────────────────────────

describe('CustomerRoleEvaluator', () => {
  const evaluator = new CustomerRoleEvaluator();

  it('IN: rol del user está en la lista', () => {
    const ctx = makeContext({ customerRole: 'VIP_LOVER' });
    expect(evaluator.evaluate({ type: 'CUSTOMER_ROLE', operator: 'IN', value: 'VIP_LOVER,VIP_LEGEND' }, ctx)).toBe(true);
  });

  it('IN: rol no está en la lista', () => {
    const ctx = makeContext({ customerRole: 'MEMBER' });
    expect(evaluator.evaluate({ type: 'CUSTOMER_ROLE', operator: 'IN', value: 'VIP_LOVER,VIP_LEGEND' }, ctx)).toBe(false);
  });

  it('sin rol (null) → false', () => {
    const ctx = makeContext({ customerRole: null });
    expect(evaluator.evaluate({ type: 'CUSTOMER_ROLE', operator: 'EQUALS', value: 'VIP_FAN' }, ctx)).toBe(false);
  });
});

// ─── PERCENTAGE DISCOUNT APPLIER ───────────────────────────────

describe('PercentageDiscountApplier', () => {
  const applier = new PercentageDiscountApplier();

  it('10% de $920 = $92', () => {
    const ctx = makeContext();
    const discount = applier.apply(
      { type: 'PERCENTAGE_DISCOUNT', value: '10', target: 'CART', maxDiscountInCents: null },
      ctx, 92000,
    );
    expect(discount).toBe(9200);
  });

  it('20% de $920 con cap de $100 = $100', () => {
    const ctx = makeContext();
    const discount = applier.apply(
      { type: 'PERCENTAGE_DISCOUNT', value: '20', target: 'CART', maxDiscountInCents: 10000 },
      ctx, 92000,
    );
    expect(discount).toBe(10000);
  });

  it('100% no excede el total actual', () => {
    const ctx = makeContext();
    const discount = applier.apply(
      { type: 'PERCENTAGE_DISCOUNT', value: '100', target: 'CART', maxDiscountInCents: null },
      ctx, 5000,
    );
    expect(discount).toBeLessThanOrEqual(5000);
  });

  it('target CHEAPEST_ITEM: descuento sobre el item más barato', () => {
    const ctx = makeContext(); // items: 35000 y 22000
    const discount = applier.apply(
      { type: 'PERCENTAGE_DISCOUNT', value: '50', target: 'CHEAPEST_ITEM', maxDiscountInCents: null },
      ctx, 92000,
    );
    // 50% del más barato (22000) = 11000
    expect(discount).toBe(11000);
  });
});

// ─── FIXED DISCOUNT APPLIER ────────────────────────────────────

describe('FixedDiscountApplier', () => {
  const applier = new FixedDiscountApplier();

  it('$50 de descuento en carrito de $920', () => {
    const ctx = makeContext();
    const discount = applier.apply(
      { type: 'FIXED_DISCOUNT', value: '50', target: 'CART', maxDiscountInCents: null },
      ctx, 92000,
    );
    expect(discount).toBe(5000);
  });

  it('descuento no excede el total del carrito', () => {
    const ctx = makeContext();
    const discount = applier.apply(
      { type: 'FIXED_DISCOUNT', value: '5000', target: 'CART', maxDiscountInCents: null },
      ctx, 3000, // carrito de $30
    );
    expect(discount).toBeLessThanOrEqual(3000);
  });

  it('target CHEAPEST_ITEM: no excede precio del item barato', () => {
    const ctx = makeContext(); // más barato = 22000
    const discount = applier.apply(
      { type: 'FIXED_DISCOUNT', value: '500', target: 'CHEAPEST_ITEM', maxDiscountInCents: null },
      ctx, 92000,
    );
    expect(discount).toBeLessThanOrEqual(22000);
  });
});

// ─── PROMOTION RESOLVER (STACKING + PRIORITY) ─────────────────

describe('PromotionResolver', () => {
  const resolver = new PromotionResolver();

  function promo(id: string, priority: number, stackable: boolean) {
    return { id, priority, stackable } as any;
  }

  it('promo única pasa directo', () => {
    const result = resolver.resolve([promo('a', 1, true)]);
    expect(result.length).toBe(1);
  });

  it('non-stackable bloquea las siguientes', () => {
    const result = resolver.resolve([
      promo('a', 10, false), // primera, non-stackable
      promo('b', 5, true),   // bloqueada
    ]);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('a');
  });

  it('stackables se acumulan', () => {
    const result = resolver.resolve([
      promo('a', 10, true),
      promo('b', 5, true),
      promo('c', 1, true),
    ]);
    expect(result.length).toBe(3);
  });

  it('stackable + non-stackable: la non-stackable corta la cadena', () => {
    const result = resolver.resolve([
      promo('a', 10, true),  // pasa
      promo('b', 5, false),  // pasa pero corta
      promo('c', 1, true),   // bloqueada
    ]);
    expect(result.length).toBe(2);
    expect(result.map((r: any) => r.id)).toEqual(['a', 'b']);
  });

  it('respeta orden por prioridad (ya viene ordenado)', () => {
    const result = resolver.resolve([
      promo('high', 10, true),
      promo('low', 1, true),
    ]);
    expect(result[0].id).toBe('high');
  });
});
