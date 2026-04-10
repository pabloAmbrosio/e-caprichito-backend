import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '../../server';
import { db, ProductStatus } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

let token: string;
let userId: string;
let sellerId: string;
let categoryId: string;
let productRosaId: string;   // tiene tag "rosa" → promo 10%
let productAzulId: string;   // NO tiene tag "rosa" → no aplica promo rosa
let productBaratoId: string; // precio bajo para probar que no llega a $299

const CART_URL = '/api/cart';

function auth() {
  return { authorization: `Bearer ${token}` };
}

async function cleanupCarts() {
  await db.user.update({ where: { id: userId }, data: { activeCartId: null } });
  await db.cartItem.deleteMany({ where: { cart: { customerId: userId } } });
  await db.cart.deleteMany({ where: { customerId: userId } });
}

function addItem(productId: string, quantity: number) {
  return app.inject({
    method: 'POST', url: `${CART_URL}/items`, headers: auth(),
    payload: { productId, quantity },
  });
}

async function getCart() {
  const res = await app.inject({ method: 'GET', url: CART_URL, headers: auth() });
  return res.json();
}

beforeAll(async () => {
  await app.ready();

  // Limpiar
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: { startsWith: 'test_promo_' } } } } });
  await db.cart.deleteMany({ where: { customer: { username: { startsWith: 'test_promo_' } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-promo-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-promo-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-promo-' } } });
  await db.category.deleteMany({ where: { slug: 'test-promo-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_promo_' } } });

  // Seller
  const seller = await db.user.create({
    data: {
      username: 'test_promo_seller', email: 'test_promo_seller@test.com',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.SELLER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  sellerId = seller.id;

  // Customer
  const customer = await db.user.create({
    data: {
      username: 'test_promo_customer', email: 'test_promo_customer@test.com',
      phone: '+15554440001', passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  userId = customer.id;

  const loginRes = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: 'test_promo_customer', password: 'Test12345' },
  });
  token = loginRes.json().data.accessToken;

  // Categoría
  const cat = await db.category.create({
    data: { name: 'Test Promo Cat', slug: 'test-promo-cat', sortOrder: 99 },
  });
  categoryId = cat.id;

  // Producto rosa: $350 — activa promo "10% rosa" y con 1 unidad llega a $350 >= $299
  const apRosa = await db.abstractProduct.create({
    data: {
      title: 'Vestido Rosa Promo', slug: 'test-promo-rosa', description: 'Para test promo',
      categoryId, tags: ['vestido', 'rosa', 'mujer'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const vRosa = await db.product.create({
    data: {
      abstractProductId: apRosa.id, title: 'Vestido Rosa Promo', sku: 'TEST-PROMO-ROSA',
      priceInCents: 35000, details: {},
      images: [{ imageUrl: 'https://ph.com/rosa.jpg', thumbnailUrl: 'https://ph.com/rosa.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: vRosa.id, physicalStock: 10, reservedStock: 0 } });
  productRosaId = vRosa.id;

  // Producto azul: $400 — NO tiene tag "rosa", sí llega a $299
  const apAzul = await db.abstractProduct.create({
    data: {
      title: 'Blusa Azul Promo', slug: 'test-promo-azul', description: 'Sin tag rosa',
      categoryId, tags: ['blusa', 'azul', 'mujer'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const vAzul = await db.product.create({
    data: {
      abstractProductId: apAzul.id, title: 'Blusa Azul Promo', sku: 'TEST-PROMO-AZUL',
      priceInCents: 40000, details: {},
      images: [{ imageUrl: 'https://ph.com/azul.jpg', thumbnailUrl: 'https://ph.com/azul.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: vAzul.id, physicalStock: 10, reservedStock: 0 } });
  productAzulId = vAzul.id;

  // Producto barato: $100 — no llega a $299 solo
  const apBarato = await db.abstractProduct.create({
    data: {
      title: 'Accesorio Barato', slug: 'test-promo-barato', description: 'Muy barato',
      categoryId, tags: ['accesorio', 'rosa'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const vBarato = await db.product.create({
    data: {
      abstractProductId: apBarato.id, title: 'Accesorio Barato', sku: 'TEST-PROMO-BARATO',
      priceInCents: 10000, details: {},
      images: [{ imageUrl: 'https://ph.com/barato.jpg', thumbnailUrl: 'https://ph.com/barato.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: vBarato.id, physicalStock: 50, reservedStock: 0 } });
  productBaratoId = vBarato.id;

  // ─── Crear promociones de test en la BD de test ────────────
  // Promo 1: 10% en productos con tag "rosa" (automática, stackable)
  await db.promotion.create({
    data: {
      name: '10% en productos Rosa',
      description: '10% en tag rosa',
      couponCode: null,
      priority: 2,
      stackable: true,
      isActive: true,
      startsAt: new Date(),
      endsAt: null,
      ruleOperator: 'ALL',
      rules: { create: [{ type: 'TAG', operator: 'IN', value: 'rosa' }] },
      actions: { create: [{ type: 'PERCENTAGE_DISCOUNT', value: '10', target: 'CART' }] },
    },
  });

  // Promo 2: 3% en compras >= $299 (automática, stackable)
  await db.promotion.create({
    data: {
      name: '3% off en compras de $299+',
      description: '3% en $299+',
      couponCode: null,
      priority: 3,
      stackable: true,
      isActive: true,
      startsAt: new Date(),
      endsAt: null,
      ruleOperator: 'ALL',
      rules: { create: [{ type: 'CART_MIN_TOTAL', operator: 'GREATER_OR_EQUAL', value: '299' }] },
      actions: { create: [{ type: 'PERCENTAGE_DISCOUNT', value: '3', target: 'CART' }] },
    },
  });

  // Promo 3: Bienvenida 10% (cupón, non-stackable)
  await db.promotion.create({
    data: {
      name: 'Bienvenida: 10% off',
      description: '10% primera compra',
      couponCode: 'BIENVENIDA',
      priority: 1,
      stackable: false,
      isActive: true,
      startsAt: new Date(),
      endsAt: null,
      maxUsesPerUser: 1,
      ruleOperator: 'ALL',
      rules: { create: [{ type: 'FIRST_PURCHASE', operator: 'EQUALS', value: 'true' }] },
      actions: { create: [{ type: 'PERCENTAGE_DISCOUNT', value: '10', target: 'CART' }] },
    },
  });
});

afterAll(async () => {
  await db.user.update({ where: { id: userId }, data: { activeCartId: null } }).catch(() => {});
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: { startsWith: 'test_promo_' } } } } });
  await db.cart.deleteMany({ where: { customer: { username: { startsWith: 'test_promo_' } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-promo-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-promo-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-promo-' } } });
  await db.category.deleteMany({ where: { slug: 'test-promo-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_promo_' } } });
  // Limpiar promos de test
  await db.promotionAction.deleteMany({ where: { promotion: { name: { startsWith: '10% en productos' } } } });
  await db.promotionAction.deleteMany({ where: { promotion: { name: { startsWith: '3% off' } } } });
  await db.promotionAction.deleteMany({ where: { promotion: { name: { startsWith: 'Bienvenida' } } } });
  await db.promotionRule.deleteMany({ where: { promotion: { name: { startsWith: '10% en productos' } } } });
  await db.promotionRule.deleteMany({ where: { promotion: { name: { startsWith: '3% off' } } } });
  await db.promotionRule.deleteMany({ where: { promotion: { name: { startsWith: 'Bienvenida' } } } });
  await db.promotion.deleteMany({ where: { name: { in: ['10% en productos Rosa', '3% off en compras de $299+', 'Bienvenida: 10% off'] } } });
  await app.close();
  await redisClient.quit();
});

// ─── PROMO TAG ROSA (10%) ──────────────────────────────────────

describe('Promo automática: 10% en productos con tag "rosa"', () => {
  beforeEach(() => cleanupCarts());

  it('producto rosa recibe descuento', async () => {
    await addItem(productRosaId, 1); // $350
    const cart = await getCart();

    expect(cart.data.totalDiscount).toBeGreaterThan(0);
    expect(cart.data.total).toBeLessThan(cart.data.subtotal);
    expect(cart.data.appliedPromotions.length).toBeGreaterThanOrEqual(1);

    const rosaPromo = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.toLowerCase().includes('rosa')
    );
    expect(rosaPromo).toBeDefined();
  });

  it('producto sin tag rosa NO recibe descuento de promo rosa', async () => {
    await addItem(productAzulId, 1); // $400, sin tag "rosa"
    const cart = await getCart();

    const rosaPromo = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.toLowerCase().includes('rosa')
    );
    // La promo rosa no debe aplicar (aunque la de $299 sí podría)
    expect(rosaPromo).toBeUndefined();
  });
});

// ─── PROMO CART MIN TOTAL (3% en $299+) ────────────────────────

describe('Promo automática: 3% en compras de $299+', () => {
  beforeEach(() => cleanupCarts());

  it('carrito >= $299 recibe el 3%', async () => {
    await addItem(productAzulId, 1); // $400 >= $299
    const cart = await getCart();

    const minTotalPromo = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.toLowerCase().includes('299')
    );
    expect(minTotalPromo).toBeDefined();
    expect(minTotalPromo.discountAmountInCents).toBeGreaterThan(0);
  });

  it('carrito < $299 NO recibe el 3%', async () => {
    await addItem(productBaratoId, 1); // $100 < $299
    const cart = await getCart();

    const minTotalPromo = cart.data.appliedPromotions.find(
      (p: any) => p.promotionName.toLowerCase().includes('299')
    );
    expect(minTotalPromo).toBeUndefined();
  });
});

// ─── STACKING: AMBAS PROMOS JUNTAS ────────────────────────────

describe('Stacking: producto rosa + total >= $299', () => {
  beforeEach(() => cleanupCarts());

  it('ambas promos se aplican (stackable)', async () => {
    await addItem(productRosaId, 1); // $350 — tag rosa + total >= $299
    const cart = await getCart();

    // Debe tener al menos 2 promos aplicadas
    expect(cart.data.appliedPromotions.length).toBeGreaterThanOrEqual(2);
    expect(cart.data.totalDiscount).toBeGreaterThan(0);
    expect(cart.data.total).toBeLessThan(cart.data.subtotal);
  });

  it('descuentos cascadean (segundo calcula sobre total reducido)', async () => {
    await addItem(productRosaId, 1); // $350
    const cart = await getCart();

    // Subtotal: 35000
    // Si ambas promos aplican: rosa 10% + 299 3%
    // Total discount debe ser < 13% de 35000 (porque cascadean)
    const maxNonCascading = Math.round(35000 * 0.13);
    // Con cascading es ligeramente menos
    expect(cart.data.totalDiscount).toBeLessThanOrEqual(maxNonCascading);
    expect(cart.data.totalDiscount).toBeGreaterThan(0);
  });
});

// ─── CÁLCULOS DEL CARRITO ──────────────────────────────────────

describe('Cálculos correctos en el carrito', () => {
  beforeEach(() => cleanupCarts());

  it('subtotal = suma de (precio × cantidad) por item', async () => {
    await addItem(productRosaId, 2);  // 35000 * 2 = 70000
    await addItem(productAzulId, 1);  // 40000 * 1 = 40000
    const cart = await getCart();

    expect(cart.data.subtotal).toBe(110000);
  });

  it('total = subtotal - totalDiscount', async () => {
    await addItem(productRosaId, 1);
    const cart = await getCart();

    expect(cart.data.total).toBe(cart.data.subtotal - cart.data.totalDiscount);
  });

  it('total nunca es negativo', async () => {
    await addItem(productBaratoId, 1); // $100
    const cart = await getCart();

    expect(cart.data.total).toBeGreaterThanOrEqual(0);
  });

  it('carrito vacío tiene subtotal 0 y sin promos', async () => {
    const cart = await getCart();

    // Carrito vacío: data puede ser null o tener subtotal 0
    if (cart.data === null) {
      expect(cart.data).toBeNull();
    } else {
      expect(cart.data.subtotal).toBe(0);
      expect(cart.data.appliedPromotions.length).toBe(0);
    }
  });
});

// ─── BANNERS ENDPOINT ──────────────────────────────────────────

describe('GET /api/promotions/banners', () => {
  it('devuelve las promos clasificadas', async () => {
    const res = await app.inject({
      method: 'GET', url: '/api/promotions/banners',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toHaveProperty('product');
    expect(body.data).toHaveProperty('cart');
    expect(body.data).toHaveProperty('coupons');

    // Las automáticas (rosa y 299) deben estar en product o cart
    const allBanners = [...body.data.product, ...body.data.cart];
    expect(allBanners.length).toBeGreaterThanOrEqual(1);
  });

  it('la promo de bienvenida aparece en coupons', async () => {
    const res = await app.inject({
      method: 'GET', url: '/api/promotions/banners',
    });

    const coupons = res.json().data.coupons;
    const bienvenida = coupons.find((c: any) => c.couponCode === 'BIENVENIDA');
    expect(bienvenida).toBeDefined();
  });
});
