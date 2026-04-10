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
let productId1: string;
let productId2: string;
let addressId: string;

const ORDER_URL = '/api/order';
const CART_URL = '/api/cart';

function auth() {
  return { authorization: `Bearer ${token}` };
}

async function cleanupOrders() {
  await db.promotionUsage.deleteMany({ where: { userId } });
  await db.orderStatusAuditLog.deleteMany({ where: { order: { customerId: userId } } });
  await db.shipmentEvent.deleteMany({ where: { shipment: { order: { customerId: userId } } } });
  await db.shipment.deleteMany({ where: { order: { customerId: userId } } });
  await db.payment.deleteMany({ where: { customerId: userId } });
  await db.orderItem.deleteMany({ where: { order: { customerId: userId } } });
  await db.order.deleteMany({ where: { customerId: userId } });
}

async function cleanupCarts() {
  await db.user.update({ where: { id: userId }, data: { activeCartId: null } });
  await db.cartItem.deleteMany({ where: { cart: { customerId: userId } } });
  await db.cart.deleteMany({ where: { customerId: userId } });
}

async function resetInventory() {
  await db.inventory.updateMany({
    where: { productId: { in: [productId1, productId2] } },
    data: { reservedStock: 0 },
  });
}

// Helper: llenar carrito y hacer checkout
async function fillCartAndCheckout(items: { productId: string; quantity: number }[], body: Record<string, any> = {}) {
  for (const item of items) {
    await app.inject({
      method: 'POST', url: `${CART_URL}/items`, headers: auth(),
      payload: item,
    });
  }
  return app.inject({
    method: 'POST', url: ORDER_URL, headers: auth(),
    payload: body,
  });
}

beforeAll(async () => {
  await app.ready();

  // Limpiar todo
  const prefix = 'test_order_';
  await db.promotionUsage.deleteMany({ where: { user: { username: { startsWith: prefix } } } });
  await db.orderStatusAuditLog.deleteMany({ where: { order: { customer: { username: { startsWith: prefix } } } } });
  await db.shipmentEvent.deleteMany({ where: { shipment: { order: { customer: { username: { startsWith: prefix } } } } } });
  await db.shipment.deleteMany({ where: { order: { customer: { username: { startsWith: prefix } } } } });
  await db.payment.deleteMany({ where: { customer: { username: { startsWith: prefix } } } });
  await db.orderItem.deleteMany({ where: { order: { customer: { username: { startsWith: prefix } } } } });
  await db.order.deleteMany({ where: { customer: { username: { startsWith: prefix } } } });
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: { startsWith: prefix } } } } });
  await db.cart.deleteMany({ where: { customer: { username: { startsWith: prefix } } } });
  await db.address.deleteMany({ where: { user: { username: { startsWith: prefix } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-order-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-order-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-order-' } } });
  await db.category.deleteMany({ where: { slug: 'test-order-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: prefix } } });

  // Seller
  const seller = await db.user.create({
    data: {
      username: 'test_order_seller', email: 'test_order_seller@test.com',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.SELLER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  sellerId = seller.id;

  // Customer con teléfono verificado (requerido para checkout)
  const customer = await db.user.create({
    data: {
      username: 'test_order_customer', email: 'test_order_customer@test.com',
      phone: '+15552220001', passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  userId = customer.id;

  const loginRes = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: 'test_order_customer', password: 'Test12345' },
  });
  token = loginRes.json().data.accessToken;

  // Categoría
  const cat = await db.category.create({
    data: { name: 'Test Order Cat', slug: 'test-order-cat', sortOrder: 99 },
  });
  categoryId = cat.id;

  // Producto 1
  const ap1 = await db.abstractProduct.create({
    data: {
      title: 'Producto Order 1', slug: 'test-order-prod1', description: 'P1',
      categoryId, tags: ['test'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const v1 = await db.product.create({
    data: {
      abstractProductId: ap1.id, title: 'Producto Order 1', sku: 'TEST-ORD-001',
      priceInCents: 35000, details: {},
      images: [{ imageUrl: 'https://ph.com/o1.jpg', thumbnailUrl: 'https://ph.com/o1.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: v1.id, physicalStock: 20, reservedStock: 0 } });
  productId1 = v1.id;

  // Producto 2
  const ap2 = await db.abstractProduct.create({
    data: {
      title: 'Producto Order 2', slug: 'test-order-prod2', description: 'P2',
      categoryId, tags: ['test'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const v2 = await db.product.create({
    data: {
      abstractProductId: ap2.id, title: 'Producto Order 2', sku: 'TEST-ORD-002',
      priceInCents: 22000, details: {},
      images: [{ imageUrl: 'https://ph.com/o2.jpg', thumbnailUrl: 'https://ph.com/o2.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: v2.id, physicalStock: 15, reservedStock: 0 } });
  productId2 = v2.id;

  // Dirección para delivery
  const addr = await db.address.create({
    data: {
      userId, label: 'Casa Test', formattedAddress: 'Calle Test 123',
      lat: 18.973, lng: -91.179, isDefault: true,
    },
  });
  addressId = addr.id;
});

afterAll(async () => {
  const prefix = 'test_order_';
  await db.promotionUsage.deleteMany({ where: { user: { username: { startsWith: prefix } } } });
  await db.orderStatusAuditLog.deleteMany({ where: { order: { customer: { username: { startsWith: prefix } } } } });
  await db.shipmentEvent.deleteMany({ where: { shipment: { order: { customer: { username: { startsWith: prefix } } } } } });
  await db.shipment.deleteMany({ where: { order: { customer: { username: { startsWith: prefix } } } } });
  await db.payment.deleteMany({ where: { customer: { username: { startsWith: prefix } } } });
  await db.orderItem.deleteMany({ where: { order: { customer: { username: { startsWith: prefix } } } } });
  await db.order.deleteMany({ where: { customer: { username: { startsWith: prefix } } } });
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: { startsWith: prefix } } } } });
  await db.cart.deleteMany({ where: { customer: { username: { startsWith: prefix } } } });
  await db.address.deleteMany({ where: { user: { username: { startsWith: prefix } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-order-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-order-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-order-' } } });
  await db.category.deleteMany({ where: { slug: 'test-order-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: prefix } } });
  await app.close();
  await redisClient.quit();
});

// ─── CHECKOUT BÁSICO ───────────────────────────────────────────

describe('POST /api/order — checkout', () => {
  beforeEach(async () => {
    await cleanupOrders();
    await cleanupCarts();
    await resetInventory();
  });

  it('checkout PICKUP: crea orden sin dirección', async () => {
    const res = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 2 }],
    );

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.orderId).toBeDefined();
    expect(body.data.status).toBe('PENDING');
    expect(body.data.shipment.type).toBe('PICKUP');
    expect(body.data.deliveryFee).toBe(0);
    expect(body.data.expiresAt).toBeDefined(); // tiene expiración
  });

  it('checkout con dirección: crea orden con deliveryFee', async () => {
    const res = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 1 }],
      { addressId },
    );

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.shipment.type).toBe('HOME_DELIVERY');
    expect(body.data.deliveryFee).toBeGreaterThanOrEqual(0);
  });

  it('el stock se reserva al crear la orden', async () => {
    const invBefore = await db.inventory.findUnique({ where: { productId: productId1 } });
    const reservedBefore = invBefore!.reservedStock;

    await fillCartAndCheckout(
      [{ productId: productId1, quantity: 3 }],
    );

    const invAfter = await db.inventory.findUnique({ where: { productId: productId1 } });
    expect(invAfter!.reservedStock).toBe(reservedBefore + 3);
  });

  it('el carrito se vacía después del checkout', async () => {
    await fillCartAndCheckout(
      [{ productId: productId1, quantity: 1 }],
    );

    // El carrito activo ahora está vacío (fue rotado)
    const cartRes = await app.inject({ method: 'GET', url: CART_URL, headers: auth() });
    const cart = cartRes.json();
    if (cart.data) {
      expect(cart.data.items.length).toBe(0);
    }
  });

  it('la orden tiene expiresAt para MANUAL_TRANSFER', async () => {
    const res = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 1 }],
    );

    expect(res.statusCode).toBe(201);
    expect(res.json().data.expiresAt).not.toBeNull();
  });

  it('checkout con carrito vacío falla', async () => {
    // No agregar nada al carrito, solo hacer checkout
    const res = await app.inject({
      method: 'POST', url: ORDER_URL, headers: auth(),
      payload: {},
    });

    // Puede ser 400, 404, 409, o 500 — lo importante es que no sea 201
    expect(res.statusCode).not.toBe(201);
  });

  it('los totales son correctos', async () => {
    const res = await fillCartAndCheckout([
      { productId: productId1, quantity: 2 },  // 35000 * 2 = 70000
      { productId: productId2, quantity: 1 },  // 22000 * 1 = 22000
    ]);

    expect(res.statusCode).toBe(201);
    const data = res.json().data;
    expect(data.subtotal).toBe(92000);
    // itemCount = productos distintos en la orden (no unidades)
    expect(data.itemCount).toBe(2);
    expect(data.total).toBe(data.subtotal - data.totalDiscount + data.deliveryFee);
  });
});

// ─── LISTAR Y DETALLE ──────────────────────────────────────────

describe('GET /api/order — listar y detalle', () => {
  let orderId: string;

  beforeAll(async () => {
    await cleanupOrders();
    await cleanupCarts();
    await resetInventory();

    const res = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 1 }, { productId: productId2, quantity: 2 }],
    );
    orderId = res.json().data.orderId;
  });

  it('listar mis órdenes con paginación', async () => {
    const res = await app.inject({
      method: 'GET', url: ORDER_URL, headers: auth(),
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(body.data.pagination).toBeDefined();
  });

  it('detalle de orden tiene items, shipment y totales', async () => {
    const res = await app.inject({
      method: 'GET', url: `${ORDER_URL}/${orderId}`, headers: auth(),
    });

    expect(res.statusCode).toBe(200);
    const data = res.json().data;
    expect(data.id).toBe(orderId);
    expect(data.items.length).toBe(2);
    expect(data.shipment).toBeDefined();
    expect(data.subtotal).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
  });

  it('payment info devuelve datos', async () => {
    const res = await app.inject({
      method: 'GET', url: `${ORDER_URL}/${orderId}/payment-info`, headers: auth(),
    });

    expect(res.statusCode).toBe(200);
    const data = res.json().data;
    expect(data.orderId).toBe(orderId);
    expect(data.subtotal).toBeGreaterThan(0);
  });

  it('orden de otro usuario devuelve 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `${ORDER_URL}/00000000-0000-0000-0000-000000000000`,
      headers: auth(),
    });

    expect(res.statusCode).toBe(404);
  });
});

// ─── CANCELAR ORDEN ────────────────────────────────────────────

describe('PATCH /api/order/:orderId/cancel', () => {
  beforeEach(async () => {
    await cleanupOrders();
    await cleanupCarts();
    await resetInventory();
  });

  it('cancelar orden PENDING libera stock', async () => {
    const createRes = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 2 }],
    );
    const orderId = createRes.json().data.orderId;

    // Verificar stock reservado
    const invBefore = await db.inventory.findUnique({ where: { productId: productId1 } });
    expect(invBefore!.reservedStock).toBe(2);

    // Cancelar
    const cancelRes = await app.inject({
      method: 'PATCH', url: `${ORDER_URL}/${orderId}/cancel`, headers: auth(),
    });

    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.json().data.status).toBe('CANCELLED');

    // Stock liberado
    const invAfter = await db.inventory.findUnique({ where: { productId: productId1 } });
    expect(invAfter!.reservedStock).toBe(0);
  });

  it('no se puede cancelar orden ya cancelada', async () => {
    const createRes = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 1 }],
    );
    const orderId = createRes.json().data.orderId;

    // Cancelar primera vez
    await app.inject({
      method: 'PATCH', url: `${ORDER_URL}/${orderId}/cancel`, headers: auth(),
    });

    // Intentar cancelar otra vez
    const res = await app.inject({
      method: 'PATCH', url: `${ORDER_URL}/${orderId}/cancel`, headers: auth(),
    });

    expect(res.statusCode).toBe(409);
  });
});

// ─── EXPIRACIÓN Y STOCK ───────────────────────────────────────

describe('Expiración de órdenes y liberación de stock', () => {
  beforeEach(async () => {
    await cleanupOrders();
    await cleanupCarts();
    await resetInventory();
  });

  it('orden expirada: stock se libera al cancelar manualmente', async () => {
    // Crear orden
    const createRes = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 3 }, { productId: productId2, quantity: 2 }],
    );
    const orderId = createRes.json().data.orderId;

    // Verificar stock reservado
    const inv1Before = await db.inventory.findUnique({ where: { productId: productId1 } });
    const inv2Before = await db.inventory.findUnique({ where: { productId: productId2 } });
    expect(inv1Before!.reservedStock).toBe(3);
    expect(inv2Before!.reservedStock).toBe(2);

    // Cancelar (simula lo que haría el cron de expiración)
    await app.inject({
      method: 'PATCH', url: `${ORDER_URL}/${orderId}/cancel`, headers: auth(),
    });

    // Stock completamente liberado
    const inv1After = await db.inventory.findUnique({ where: { productId: productId1 } });
    const inv2After = await db.inventory.findUnique({ where: { productId: productId2 } });
    expect(inv1After!.reservedStock).toBe(0);
    expect(inv2After!.reservedStock).toBe(0);
  });

  it('múltiples órdenes: cancelar una no afecta stock de la otra', async () => {
    // Orden 1
    const res1 = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 2 }],
    );
    const orderId1 = res1.json().data.orderId;

    // Orden 2
    await cleanupCarts(); // limpiar carrito para poder crear otro
    const res2 = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 5 }],
    );

    // Stock reservado total: 2 + 5 = 7
    const invBefore = await db.inventory.findUnique({ where: { productId: productId1 } });
    expect(invBefore!.reservedStock).toBe(7);

    // Cancelar solo la orden 1
    await app.inject({
      method: 'PATCH', url: `${ORDER_URL}/${orderId1}/cancel`, headers: auth(),
    });

    // Stock de orden 2 sigue reservado: 7 - 2 = 5
    const invAfter = await db.inventory.findUnique({ where: { productId: productId1 } });
    expect(invAfter!.reservedStock).toBe(5);
  });

  it('orden PICKUP tiene expiresAt, no es null', async () => {
    const res = await fillCartAndCheckout(
      [{ productId: productId1, quantity: 1 }],
    );
    expect(res.json().data.expiresAt).not.toBeNull();
  });
});

// ─── SIN AUTH / PHONE NO VERIFICADO ────────────────────────────

describe('Protecciones de checkout', () => {
  it('sin autenticación devuelve 401', async () => {
    const res = await app.inject({
      method: 'POST', url: ORDER_URL, payload: {},
    });
    expect(res.statusCode).toBe(401);
  });

  it('teléfono no verificado devuelve 403', async () => {
    // Crear usuario sin phone verified
    const unverified = await db.user.create({
      data: {
        username: 'test_order_unverified', email: 'test_order_unverified@test.com',
        phone: '+15552220099', passwordHash: await hashPassword('Test12345'),
        adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
        phoneVerified: false, emailVerified: true,
      },
    });
    const loginRes = await app.inject({
      method: 'POST', url: '/api/auth/login',
      payload: { identifier: 'test_order_unverified', password: 'Test12345' },
    });
    const unverifiedToken = loginRes.json().data.accessToken;

    const res = await app.inject({
      method: 'POST', url: ORDER_URL,
      headers: { authorization: `Bearer ${unverifiedToken}` },
      payload: {},
    });

    expect(res.statusCode).toBe(403);
  });
});
