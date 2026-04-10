import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '../../server';
import { db, ProductStatus } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

/**
 * Tests de ciclo de vida de promociones:
 * - ¿Qué pasa cuando la promo está a punto de expirar?
 * - ¿Qué pasa cuando un admin desactiva la promo manualmente?
 * - ¿Qué pasa si el cliente decide pagar después de que la promo desaparece?
 * - ¿El carrito re-evalúa promos en cada GET?
 */

const app = buildServer();

let token: string;
let userId: string;
let sellerId: string;
let categoryId: string;
let productId: string;
let promoId: string;

const CART_URL = '/api/cart';

function auth() {
  return { authorization: `Bearer ${token}` };
}

async function cleanupCarts() {
  await db.user.update({ where: { id: userId }, data: { activeCartId: null } });
  await db.cartItem.deleteMany({ where: { cart: { customerId: userId } } });
  await db.cart.deleteMany({ where: { customerId: userId } });
}

async function cleanupPromos() {
  await db.promotionAction.deleteMany({ where: { promotion: { name: { startsWith: 'Test Lifecycle' } } } });
  await db.promotionRule.deleteMany({ where: { promotion: { name: { startsWith: 'Test Lifecycle' } } } });
  await db.promotion.deleteMany({ where: { name: { startsWith: 'Test Lifecycle' } } });
}

function addItem(pid: string, qty: number) {
  return app.inject({
    method: 'POST', url: `${CART_URL}/items`, headers: auth(),
    payload: { productId: pid, quantity: qty },
  });
}

async function getCart() {
  const res = await app.inject({ method: 'GET', url: CART_URL, headers: auth() });
  return res.json();
}

// Crear promo de test con endsAt configurable
async function createTestPromo(overrides: Record<string, any> = {}) {
  const promo = await db.promotion.create({
    data: {
      name: 'Test Lifecycle Promo 20%',
      description: '20% de descuento para test lifecycle',
      couponCode: null,
      priority: 50, // alta prioridad para que siempre aplique primero
      stackable: true,
      isActive: true,
      startsAt: new Date('2020-01-01'),
      endsAt: null,
      ruleOperator: 'ALL',
      rules: { create: [{ type: 'TAG', operator: 'IN', value: 'lifecycle' }] },
      actions: { create: [{ type: 'PERCENTAGE_DISCOUNT', value: '20', target: 'CART' }] },
      ...overrides,
    },
  });
  promoId = promo.id;
  return promo;
}

beforeAll(async () => {
  await app.ready();

  // Limpiar
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: 'test_lifecycle_customer' } } } });
  await db.cart.deleteMany({ where: { customer: { username: 'test_lifecycle_customer' } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: 'test-lifecycle-product' } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: 'test-lifecycle-product' } } });
  await db.abstractProduct.deleteMany({ where: { slug: 'test-lifecycle-product' } });
  await db.category.deleteMany({ where: { slug: 'test-lifecycle-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_lifecycle_' } } });
  await cleanupPromos();

  // Seller
  const seller = await db.user.create({
    data: {
      username: 'test_lifecycle_seller', email: 'test_lifecycle_seller@test.com',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.SELLER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  sellerId = seller.id;

  // Customer
  const customer = await db.user.create({
    data: {
      username: 'test_lifecycle_customer', email: 'test_lifecycle_customer@test.com',
      phone: '+15553330001', passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  userId = customer.id;

  const loginRes = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: 'test_lifecycle_customer', password: 'Test12345' },
  });
  token = loginRes.json().data.accessToken;

  // Categoría y producto
  const cat = await db.category.create({
    data: { name: 'Test Lifecycle Cat', slug: 'test-lifecycle-cat', sortOrder: 99 },
  });
  categoryId = cat.id;

  const ap = await db.abstractProduct.create({
    data: {
      title: 'Producto Lifecycle', slug: 'test-lifecycle-product', description: 'Para test',
      categoryId, tags: ['lifecycle', 'rosa'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const v = await db.product.create({
    data: {
      abstractProductId: ap.id, title: 'Producto Lifecycle', sku: 'TEST-LIFECYCLE-001',
      priceInCents: 50000, details: {},
      images: [{ imageUrl: 'https://ph.com/lc.jpg', thumbnailUrl: 'https://ph.com/lc.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: v.id, physicalStock: 10, reservedStock: 0 } });
  productId = v.id;
});

afterAll(async () => {
  await db.user.update({ where: { id: userId }, data: { activeCartId: null } }).catch(() => {});
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: 'test_lifecycle_customer' } } } });
  await db.cart.deleteMany({ where: { customer: { username: 'test_lifecycle_customer' } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: 'test-lifecycle-product' } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: 'test-lifecycle-product' } } });
  await db.abstractProduct.deleteMany({ where: { slug: 'test-lifecycle-product' } });
  await db.category.deleteMany({ where: { slug: 'test-lifecycle-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_lifecycle_' } } });
  await cleanupPromos();
  await app.close();
  await redisClient.quit();
});

// ─── PROMO ACTIVA → CLIENTE VE DESCUENTO ───────────────────────

describe('Promo activa: el carrito refleja el descuento', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('con promo activa, el carrito muestra descuento', async () => {
    await createTestPromo();
    await addItem(productId, 1); // $500

    const cart = await getCart();
    expect(cart.data.totalDiscount).toBeGreaterThan(0);
    expect(cart.data.appliedPromotions.length).toBeGreaterThanOrEqual(1);

    const promo = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promo).toBeDefined();
    // 20% de 50000 = 10000
    expect(promo.discountAmountInCents).toBe(10000);
  });
});

// ─── ADMIN DESACTIVA LA PROMO ──────────────────────────────────

describe('Admin desactiva promo: el carrito se actualiza', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('después de desactivar, el siguiente GET ya no muestra descuento', async () => {
    await createTestPromo();
    await addItem(productId, 1);

    // Verificar que la promo aplica
    const cartBefore = await getCart();
    const promoBefore = cartBefore.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promoBefore).toBeDefined();

    // Admin desactiva la promo
    await db.promotion.update({
      where: { id: promoId },
      data: { isActive: false },
    });

    // El siguiente GET ya no muestra el descuento de esta promo
    const cartAfter = await getCart();
    const promoAfter = cartAfter.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promoAfter).toBeUndefined();
  });

  it('el total vuelve al subtotal original al desactivar la promo', async () => {
    await createTestPromo();
    await addItem(productId, 1); // $500

    const cartBefore = await getCart();
    const discountBefore = cartBefore.data.totalDiscount;
    expect(discountBefore).toBeGreaterThan(0);

    // Desactivar
    await db.promotion.update({
      where: { id: promoId },
      data: { isActive: false },
    });

    const cartAfter = await getCart();
    // El descuento de la promo lifecycle ya no está
    // (puede quedar descuento de otras promos como la de $299)
    const lifecyclePromo = cartAfter.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(lifecyclePromo).toBeUndefined();
  });
});

// ─── PROMO EXPIRADA ────────────────────────────────────────────

describe('Promo expirada: desaparece del carrito', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('promo ya expirada no aplica', async () => {
    // Crear promo que ya expiró hace 1 hora
    await createTestPromo({
      endsAt: new Date(Date.now() - 60 * 60 * 1000),
    });
    await addItem(productId, 1);

    const cart = await getCart();
    const promo = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promo).toBeUndefined();
  });

  it('promo que expira entre dos GETs del carrito desaparece', async () => {
    // Crear promo que expira en 2 segundos
    const endsAt = new Date(Date.now() + 2000);
    await createTestPromo({ endsAt });
    await addItem(productId, 1);

    // Primer GET: promo vigente
    const cartBefore = await getCart();
    const promoBefore = cartBefore.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promoBefore).toBeDefined();

    // Forzar expiración directa en BD (simular paso del tiempo)
    await db.promotion.update({
      where: { id: promoId },
      data: { endsAt: new Date(Date.now() - 1000) }, // ya expiró
    });

    // Segundo GET: promo expirada
    const cartAfter = await getCart();
    const promoAfter = cartAfter.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promoAfter).toBeUndefined();
  });
});

// ─── PROMO A PUNTO DE EXPIRAR ──────────────────────────────────

describe('Promo a punto de expirar: todavía aplica', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('promo que expira en 5 minutos todavía aplica', async () => {
    await createTestPromo({
      endsAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });
    await addItem(productId, 1);

    const cart = await getCart();
    const promo = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promo).toBeDefined();
    expect(promo.discountAmountInCents).toBe(10000);
  });
});

// ─── RE-EVALUACIÓN EN CADA GET ─────────────────────────────────

describe('El carrito re-evalúa promos en cada GET', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('crear promo DESPUÉS de agregar items: el GET la detecta', async () => {
    await addItem(productId, 1);

    // Sin promo: no hay descuento
    const cartSin = await getCart();
    const promoSin = cartSin.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promoSin).toBeUndefined();

    // Crear promo
    await createTestPromo();

    // Con promo: ahora sí
    const cartCon = await getCart();
    const promoCon = cartCon.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promoCon).toBeDefined();
    expect(promoCon.discountAmountInCents).toBe(10000);
  });

  it('cambiar valor del descuento: el GET refleja el nuevo cálculo', async () => {
    await createTestPromo(); // 20%
    await addItem(productId, 1); // $500

    const cartBefore = await getCart();
    expect(cartBefore.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    ).discountAmountInCents).toBe(10000); // 20% de 50000

    // Cambiar a 50%
    const action = await db.promotionAction.findFirst({ where: { promotionId: promoId } });
    await db.promotionAction.update({
      where: { id: action!.id },
      data: { value: '50' },
    });

    const cartAfter = await getCart();
    expect(cartAfter.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    ).discountAmountInCents).toBe(25000); // 50% de 50000
  });
});

// ─── SOFT DELETE DE PROMO ──────────────────────────────────────

describe('Soft delete de promo: desaparece del carrito', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('promo con deletedAt ya no aplica', async () => {
    await createTestPromo();
    await addItem(productId, 1);

    // Verificar que aplica
    const cartBefore = await getCart();
    expect(cartBefore.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    )).toBeDefined();

    // Soft delete
    await db.promotion.update({
      where: { id: promoId },
      data: { deletedAt: new Date() },
    });

    // Ya no aplica
    const cartAfter = await getCart();
    expect(cartAfter.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    )).toBeUndefined();
  });
});

// ─── PROMO RE-ACTIVADA ─────────────────────────────────────────

describe('Promo re-activada después de desactivar', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('desactivar → reactivar: el descuento vuelve', async () => {
    await createTestPromo();
    await addItem(productId, 1);

    // Aplica
    const cart1 = await getCart();
    expect(cart1.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    )).toBeDefined();

    // Desactivar
    await db.promotion.update({ where: { id: promoId }, data: { isActive: false } });

    // No aplica
    const cart2 = await getCart();
    expect(cart2.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    )).toBeUndefined();

    // Reactivar
    await db.promotion.update({ where: { id: promoId }, data: { isActive: true } });

    // Vuelve a aplicar
    const cart3 = await getCart();
    const promo = cart3.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(promo).toBeDefined();
    expect(promo.discountAmountInCents).toBe(10000);
  });
});

// ─── UNA PROMO EXPIRA, OTRA SOBREVIVE ──────────────────────────

describe('Dos promos stackeadas: una expira, la otra sigue', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('la promo que sobrevive sigue aplicando sola', async () => {
    // Promo A: 20% — expira pronto
    const promoA = await db.promotion.create({
      data: {
        name: 'Test Lifecycle Promo A',
        description: 'Expira',
        couponCode: null,
        priority: 50,
        stackable: true,
        isActive: true,
        startsAt: new Date('2020-01-01'),
        endsAt: new Date(Date.now() + 60000), // expira en 1 min
        ruleOperator: 'ALL',
        rules: { create: [{ type: 'TAG', operator: 'IN', value: 'lifecycle' }] },
        actions: { create: [{ type: 'PERCENTAGE_DISCOUNT', value: '20', target: 'CART' }] },
      },
    });

    // Promo B: 5% — no expira
    await db.promotion.create({
      data: {
        name: 'Test Lifecycle Promo B',
        description: 'Permanente',
        couponCode: null,
        priority: 40,
        stackable: true,
        isActive: true,
        startsAt: new Date('2020-01-01'),
        endsAt: null,
        ruleOperator: 'ALL',
        rules: { create: [{ type: 'TAG', operator: 'IN', value: 'lifecycle' }] },
        actions: { create: [{ type: 'PERCENTAGE_DISCOUNT', value: '5', target: 'CART' }] },
      },
    });

    await addItem(productId, 1); // $500

    // Ambas aplican
    const cartBoth = await getCart();
    const promoABefore = cartBoth.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Promo A')
    );
    const promoBBefore = cartBoth.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Promo B')
    );
    expect(promoABefore).toBeDefined();
    expect(promoBBefore).toBeDefined();

    // Expirar promo A
    await db.promotion.update({
      where: { id: promoA.id },
      data: { endsAt: new Date(Date.now() - 1000) },
    });

    // Solo promo B aplica
    const cartAfter = await getCart();
    const promoAAfter = cartAfter.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Promo A')
    );
    const promoBAfter = cartAfter.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Promo B')
    );
    expect(promoAAfter).toBeUndefined();
    expect(promoBAfter).toBeDefined();
    expect(promoBAfter.discountAmountInCents).toBeGreaterThan(0);
  });
});

// ─── PROMO CON LÍMITE DE USO AGOTADO ──────────────────────────

describe('Promo con maxUsesPerUser agotado', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('si el usuario ya usó la promo, no aplica más', async () => {
    // Crear promo con maxUsesPerUser: 1
    const promo = await createTestPromo({ maxUsesPerUser: 1 });

    // Simular que ya la usó: crear una orden fake + PromotionUsage
    const fakeOrder = await db.order.create({
      data: {
        customerId: userId,
        status: 'CONFIRMED',
        discountTotalInCents: 10000,
      },
    });
    await db.promotionUsage.create({
      data: {
        promotionId: promo.id,
        userId,
        orderId: fakeOrder.id,
        discountAmountInCents: 10000,
      },
    });

    await addItem(productId, 1);

    const cart = await getCart();
    const found = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(found).toBeUndefined();

    // Cleanup
    await db.promotionUsage.deleteMany({ where: { promotionId: promo.id } });
    await db.order.deleteMany({ where: { customerId: userId } });
  });
});

// ─── PROMO QUE AÚN NO EMPIEZA ─────────────────────────────────

describe('Promo con startsAt en el futuro', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('promo futura no aplica', async () => {
    await createTestPromo({
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // mañana
    });

    await addItem(productId, 1);

    const cart = await getCart();
    const found = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(found).toBeUndefined();
  });
});

// ─── CAMBIAR REGLA DE LA PROMO ─────────────────────────────────

describe('Cambiar regla de la promo: target diferente', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('cambiar tag de "lifecycle" a "noexiste": pierde el descuento', async () => {
    await createTestPromo();
    await addItem(productId, 1); // tags: ['lifecycle', 'rosa']

    // Aplica con tag "lifecycle"
    const cartBefore = await getCart();
    expect(cartBefore.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    )).toBeDefined();

    // Cambiar la regla: ahora requiere tag "noexiste"
    const rule = await db.promotionRule.findFirst({ where: { promotionId: promoId } });
    await db.promotionRule.update({
      where: { id: rule!.id },
      data: { value: 'noexiste' },
    });

    // Ya no aplica
    const cartAfter = await getCart();
    expect(cartAfter.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    )).toBeUndefined();
  });
});

// ─── MOMENTO EXACTO DE EXPIRACIÓN + GRACE PERIOD ──────────────

describe('Promo en el momento exacto de expiración', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await cleanupPromos();
  });

  it('promo que expiró hace 1 segundo (sin grace period): ya no aplica', async () => {
    await createTestPromo({
      endsAt: new Date(Date.now() - 1000),
    });
    await addItem(productId, 1);

    const cart = await getCart();
    const found = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(found).toBeUndefined();
  });

  it('promo que expira en 1 segundo: todavía aplica', async () => {
    await createTestPromo({
      endsAt: new Date(Date.now() + 1000),
    });
    await addItem(productId, 1);

    const cart = await getCart();
    const found = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(found).toBeDefined();
    expect(found.discountAmountInCents).toBe(10000);
  });

  it('promo expirada pero dentro del grace period: todavía aplica', async () => {
    const originalGrace = process.env.PROMOTION_GRACE_PERIOD_MINUTES;
    process.env.PROMOTION_GRACE_PERIOD_MINUTES = '5';

    // Expiró hace 2 min — dentro del grace de 5 min
    await createTestPromo({
      endsAt: new Date(Date.now() - 2 * 60 * 1000),
    });
    await addItem(productId, 1);

    const cart = await getCart();
    const found = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(found).toBeDefined();

    process.env.PROMOTION_GRACE_PERIOD_MINUTES = originalGrace || '0';
  });

  it('promo expirada FUERA del grace period: no aplica', async () => {
    const originalGrace = process.env.PROMOTION_GRACE_PERIOD_MINUTES;
    process.env.PROMOTION_GRACE_PERIOD_MINUTES = '5';

    // Expiró hace 10 min — fuera del grace de 5 min
    await createTestPromo({
      endsAt: new Date(Date.now() - 10 * 60 * 1000),
    });
    await addItem(productId, 1);

    const cart = await getCart();
    const found = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.includes('Lifecycle')
    );
    expect(found).toBeUndefined();

    process.env.PROMOTION_GRACE_PERIOD_MINUTES = originalGrace || '0';
  });
});
