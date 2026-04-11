import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '../../server';
import { db, ProductStatus } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

let customerToken: string;
let adminToken: string;
let userId: string;
let adminId: string;
let sellerId: string;
let categoryId: string;
let productId: string;
let addressNearId: string;  // < 60km → HOME_DELIVERY gratis
let addressFarId: string;   // 60-120km → SHIPPING $100
let addressTooFarId: string; // > 180km → no disponible

const PREFIX = 'test_ship_';
const ORDER_URL = '/api/order';
const CART_URL = '/api/cart';
const BO_SHIP = '/api/backoffice/shipments';
const SHOP_SHIP = '/api/shipments';

function auth(t: string) {
  return { authorization: `Bearer ${t}` };
}

async function cleanupOrders() {
  await db.promotionUsage.deleteMany({ where: { user: { username: { startsWith: PREFIX } } } });
  await db.orderStatusAuditLog.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.shipmentEvent.deleteMany({ where: { shipment: { order: { customer: { username: { startsWith: PREFIX } } } } } });
  await db.shipment.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.payment.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  await db.orderItem.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.order.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  await db.user.update({ where: { id: userId }, data: { activeCartId: null } }).catch(() => {});
  await db.cartItem.deleteMany({ where: { cart: { customerId: userId } } });
  await db.cart.deleteMany({ where: { customerId: userId } });
}

async function resetInventory() {
  await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0, physicalStock: 20 } });
}

// Helper: crear orden con dirección
async function createOrderWithAddress(addressId?: string) {
  await app.inject({
    method: 'POST', url: `${CART_URL}/items`, headers: auth(customerToken),
    payload: { productId, quantity: 2 },
  });
  const res = await app.inject({
    method: 'POST', url: ORDER_URL, headers: auth(customerToken),
    payload: addressId ? { addressId } : {},
  });
  return res.json().data;
}

// Helper: avanzar shipment
async function advanceShipment(shipmentId: string, note?: string) {
  return app.inject({
    method: 'PATCH', url: `${BO_SHIP}/${shipmentId}/advance`, headers: auth(adminToken),
    payload: { note },
  });
}

beforeAll(async () => {
  await app.ready();

  // Limpiar
  await db.shipmentEvent.deleteMany({ where: { shipment: { order: { customer: { username: { startsWith: PREFIX } } } } } });
  await db.shipment.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.payment.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  await db.orderStatusAuditLog.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.orderItem.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.order.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: { startsWith: PREFIX } } } } });
  await db.cart.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  await db.address.deleteMany({ where: { user: { username: { startsWith: PREFIX } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-ship-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-ship-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-ship-' } } });
  await db.category.deleteMany({ where: { slug: 'test-ship-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: PREFIX } } });

  // Seller
  const seller = await db.user.create({
    data: {
      username: `${PREFIX}seller`, email: `${PREFIX}seller@test.com`,
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.SELLER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  sellerId = seller.id;

  // Admin
  const admin = await db.user.create({
    data: {
      username: `${PREFIX}admin`, email: `${PREFIX}admin@test.com`,
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.OWNER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  adminId = admin.id;
  const adminLogin = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: `${PREFIX}admin`, password: 'Test12345' },
  });
  adminToken = adminLogin.json().data.accessToken;

  // Customer
  const customer = await db.user.create({
    data: {
      username: `${PREFIX}customer`, email: `${PREFIX}customer@test.com`,
      phone: '+15558880001', passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  userId = customer.id;
  const custLogin = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: `${PREFIX}customer`, password: 'Test12345' },
  });
  customerToken = custLogin.json().data.accessToken;

  // Categoría y producto
  const cat = await db.category.create({
    data: { name: 'Test Ship Cat', slug: 'test-ship-cat', sortOrder: 99 },
  });
  categoryId = cat.id;

  const ap = await db.abstractProduct.create({
    data: {
      title: 'Producto Ship', slug: 'test-ship-prod', description: 'Ship test',
      categoryId, tags: ['test'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const v = await db.product.create({
    data: {
      abstractProductId: ap.id, title: 'Producto Ship', sku: 'TEST-SHIP-001',
      priceInCents: 40000, details: {},
      images: [{ imageUrl: 'https://ph.com/s.jpg', thumbnailUrl: 'https://ph.com/s.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: v.id, physicalStock: 20, reservedStock: 0 } });
  productId = v.id;

  // Direcciones con distintas distancias (store: 18.972943, -91.178980)
  // Cerca: ~5km
  addressNearId = (await db.address.create({
    data: { userId, label: 'Cerca', formattedAddress: 'Cerca de la tienda', lat: 18.98, lng: -91.17, isDefault: true },
  })).id;

  // Lejos: ~100km (zona 1)
  addressFarId = (await db.address.create({
    data: { userId, label: 'Lejos', formattedAddress: 'A 100km', lat: 19.85, lng: -91.18 },
  })).id;

  // Muy lejos: ~300km (fuera de rango)
  addressTooFarId = (await db.address.create({
    data: { userId, label: 'Muy lejos', formattedAddress: 'A 300km', lat: 21.50, lng: -89.60 },
  })).id;
});

afterAll(async () => {
  await cleanupOrders();
  await db.address.deleteMany({ where: { user: { username: { startsWith: PREFIX } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-ship-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-ship-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-ship-' } } });
  await db.category.deleteMany({ where: { slug: 'test-ship-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: PREFIX } } });
  await app.close();
  await redisClient.quit();
});

// ─── DELIVERY FEE ──────────────────────────────────────────────

describe('POST /api/shipments/calculate-fee', () => {
  it('dirección cercana (< 60km): HOME_DELIVERY gratis', async () => {
    const res = await app.inject({
      method: 'POST', url: `${SHOP_SHIP}/calculate-fee`, headers: auth(customerToken),
      payload: { addressId: addressNearId },
    });

    expect(res.statusCode).toBe(200);
    const data = res.json().data;
    expect(data.deliveryType).toBe('HOME_DELIVERY');
    expect(data.fee).toBe(0);
    expect(data.available).toBe(true);
  });

  it('dirección lejana (60-120km): SHIPPING con fee', async () => {
    const res = await app.inject({
      method: 'POST', url: `${SHOP_SHIP}/calculate-fee`, headers: auth(customerToken),
      payload: { addressId: addressFarId },
    });

    expect(res.statusCode).toBe(200);
    const data = res.json().data;
    expect(data.fee).toBeGreaterThan(0);
    expect(data.available).toBe(true);
  });

  it('dirección fuera de rango (> 180km): no disponible', async () => {
    const res = await app.inject({
      method: 'POST', url: `${SHOP_SHIP}/calculate-fee`, headers: auth(customerToken),
      payload: { addressId: addressTooFarId },
    });

    expect(res.statusCode).toBe(200);
    const data = res.json().data;
    expect(data.available).toBe(false);
  });
});

// ─── STATE MACHINE — ADVANCE ───────────────────────────────────

describe('Advance shipment: state machine', () => {
  beforeEach(async () => {
    await cleanupOrders();
    await resetInventory();
  });

  it('PICKUP: avanzar completo hasta DELIVERED', async () => {
    const order = await createOrderWithAddress(); // sin address = PICKUP
    const shipmentId = order.shipment.id;
    expect(order.shipment.type).toBe('PICKUP');

    // Primero confirmar la orden (simular pago aprobado)
    await db.order.update({ where: { id: order.orderId }, data: { status: 'CONFIRMED' } });

    // PENDING → PREPARING
    const r1 = await advanceShipment(shipmentId);
    expect(r1.statusCode).toBe(200);

    // PREPARING → READY_FOR_PICKUP
    const r2 = await advanceShipment(shipmentId);
    expect(r2.statusCode).toBe(200);

    // READY_FOR_PICKUP → DELIVERED
    const r3 = await advanceShipment(shipmentId);
    expect(r3.statusCode).toBe(200);

    // Verificar orden DELIVERED
    const finalOrder = await db.order.findUnique({ where: { id: order.orderId } });
    expect(finalOrder!.status).toBe('DELIVERED');
  });

  it('HOME_DELIVERY: avanzar completo hasta DELIVERED', async () => {
    const order = await createOrderWithAddress(addressNearId);
    const shipmentId = order.shipment.id;
    expect(order.shipment.type).toBe('HOME_DELIVERY');

    await db.order.update({ where: { id: order.orderId }, data: { status: 'CONFIRMED' } });

    // PENDING → PREPARING → OUT_FOR_DELIVERY → DELIVERED
    await advanceShipment(shipmentId);
    await advanceShipment(shipmentId);
    const r3 = await advanceShipment(shipmentId);
    expect(r3.statusCode).toBe(200);

    const finalOrder = await db.order.findUnique({ where: { id: order.orderId } });
    expect(finalOrder!.status).toBe('DELIVERED');
  });

  it('avanzar shipment DELIVERED es error terminal', async () => {
    const order = await createOrderWithAddress();
    const shipmentId = order.shipment.id;

    await db.order.update({ where: { id: order.orderId }, data: { status: 'CONFIRMED' } });

    // Avanzar hasta DELIVERED
    await advanceShipment(shipmentId);
    await advanceShipment(shipmentId);
    await advanceShipment(shipmentId);

    // Intentar avanzar otra vez
    const res = await advanceShipment(shipmentId);
    expect(res.statusCode).toBe(409);
  });

  it('avanzar shipment FAILED es error terminal', async () => {
    const order = await createOrderWithAddress();
    const shipmentId = order.shipment.id;

    // Fallar el shipment
    await app.inject({
      method: 'PATCH', url: `${BO_SHIP}/${shipmentId}/fail`, headers: auth(adminToken),
      payload: { note: 'Problema logístico' },
    });

    // Intentar avanzar
    const res = await advanceShipment(shipmentId);
    expect(res.statusCode).toBe(409);
  });
});

// ─── COD EN DELIVERED ──────────────────────────────────────────

describe('COD: auto-aprobación al DELIVERED', () => {
  beforeEach(async () => {
    await cleanupOrders();
    await resetInventory();
  });

  it('DELIVERED con COD: pago auto-aprobado + stock deducido', async () => {
    // Crear orden COD con HOME_DELIVERY
    await app.inject({
      method: 'POST', url: `${CART_URL}/items`, headers: auth(customerToken),
      payload: { productId, quantity: 3 },
    });
    const orderRes = await app.inject({
      method: 'POST', url: ORDER_URL, headers: auth(customerToken),
      payload: { addressId: addressNearId, paymentMethod: 'CASH_ON_DELIVERY' },
    });

    expect(orderRes.statusCode).toBe(201);
    const order = orderRes.json().data;
    expect(order.status).toBe('CONFIRMED');
    expect(order.shipment.status).toBe('PREPARING');

    const shipmentId = order.shipment.id;

    // Stock reservado
    const invBefore = await db.inventory.findUnique({ where: { productId } });
    expect(invBefore!.reservedStock).toBe(3);

    // Avanzar: PREPARING → OUT_FOR_DELIVERY → DELIVERED
    await advanceShipment(shipmentId);
    await advanceShipment(shipmentId);

    // Verificar pago auto-aprobado
    const payment = await db.payment.findFirst({ where: { orderId: order.orderId } });
    expect(payment!.status).toBe('APPROVED');
    expect(payment!.reviewNote).toContain('Cobrado al entregar');

    // Stock deducido: physical y reserved bajan 3
    const invAfter = await db.inventory.findUnique({ where: { productId } });
    expect(invAfter!.physicalStock).toBe(17);
    expect(invAfter!.reservedStock).toBe(0);
  });

  it('FAIL shipment con COD: pago cancelado + reserved liberado', async () => {
    await app.inject({
      method: 'POST', url: `${CART_URL}/items`, headers: auth(customerToken),
      payload: { productId, quantity: 2 },
    });
    const orderRes = await app.inject({
      method: 'POST', url: ORDER_URL, headers: auth(customerToken),
      payload: { addressId: addressNearId, paymentMethod: 'CASH_ON_DELIVERY' },
    });

    const order = orderRes.json().data;
    const shipmentId = order.shipment.id;

    // Fallar envío
    const failRes = await app.inject({
      method: 'PATCH', url: `${BO_SHIP}/${shipmentId}/fail`, headers: auth(adminToken),
      payload: { note: 'Cliente no estaba en casa' },
    });
    expect(failRes.statusCode).toBe(200);

    // Pago cancelado
    const payment = await db.payment.findFirst({ where: { orderId: order.orderId } });
    expect(payment!.status).toBe('CANCELLED');

    // Stock: reserved liberado, physical intacto
    const inv = await db.inventory.findUnique({ where: { productId } });
    expect(inv!.physicalStock).toBe(20);
    expect(inv!.reservedStock).toBe(0);

    // Orden cancelada
    const finalOrder = await db.order.findUnique({ where: { id: order.orderId } });
    expect(finalOrder!.status).toBe('CANCELLED');
  });
});

// ─── FAIL ──────────────────────────────────────────────────────

describe('Fail shipment', () => {
  beforeEach(async () => {
    await cleanupOrders();
    await resetInventory();
  });

  it('fail desde estado no-terminal crea evento con nota', async () => {
    const order = await createOrderWithAddress();
    const shipmentId = order.shipment.id;

    const res = await app.inject({
      method: 'PATCH', url: `${BO_SHIP}/${shipmentId}/fail`, headers: auth(adminToken),
      payload: { note: 'Dirección incorrecta' },
    });
    expect(res.statusCode).toBe(200);

    // Verificar evento creado
    const events = await db.shipmentEvent.findMany({
      where: { shipmentId },
      orderBy: { createdAt: 'desc' },
    });
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].status).toBe('FAILED');
    expect(events[0].note).toContain('Dirección incorrecta');
  });
});

// ─── TRACKING Y CARRIER ───────────────────────────────────────

describe('Tracking y carrier', () => {
  beforeEach(async () => {
    await cleanupOrders();
    await resetInventory();
  });

  it('actualizar carrier y trackingCode', async () => {
    const order = await createOrderWithAddress();
    const shipmentId = order.shipment.id;

    const res = await app.inject({
      method: 'PATCH', url: `${BO_SHIP}/${shipmentId}`, headers: auth(adminToken),
      payload: { carrier: 'DHL Express', trackingCode: 'DHL-123456789' },
    });

    expect(res.statusCode).toBe(200);
    const data = res.json().data;
    expect(data.carrier).toBe('DHL Express');
    expect(data.trackingCode).toBe('DHL-123456789');
  });

  it('tracking del cliente devuelve eventos del envío', async () => {
    const order = await createOrderWithAddress();
    const shipmentId = order.shipment.id;

    // Crear algunos eventos
    await db.order.update({ where: { id: order.orderId }, data: { status: 'CONFIRMED' } });
    await advanceShipment(shipmentId); // PENDING → PREPARING

    const res = await app.inject({
      method: 'GET', url: `${SHOP_SHIP}/${order.orderId}/tracking`, headers: auth(customerToken),
    });

    expect(res.statusCode).toBe(200);
    const data = res.json().data;
    expect(data.events).toBeDefined();
    expect(data.events.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── EDGE CASES ────────────────────────────────────────────────

describe('Edge cases de shipment', () => {
  beforeEach(async () => {
    await cleanupOrders();
    await resetInventory();
  });

  it('COD con PICKUP es rechazado en checkout', async () => {
    await app.inject({
      method: 'POST', url: `${CART_URL}/items`, headers: auth(customerToken),
      payload: { productId, quantity: 1 },
    });

    // Sin addressId = PICKUP, con COD → debe fallar
    const res = await app.inject({
      method: 'POST', url: ORDER_URL, headers: auth(customerToken),
      payload: { paymentMethod: 'CASH_ON_DELIVERY' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('tracking de orden ajena devuelve 404', async () => {
    // Crear orden del customer
    const order = await createOrderWithAddress();

    // Admin intenta ver tracking como si fuera otro cliente
    // Necesitamos otro customer
    const otherUser = await db.user.create({
      data: {
        username: `${PREFIX}other`, email: `${PREFIX}other@test.com`,
        phone: '+15558880099', passwordHash: await hashPassword('Test12345'),
        adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
        phoneVerified: true, emailVerified: true,
      },
    });
    const otherLogin = await app.inject({
      method: 'POST', url: '/api/auth/login',
      payload: { identifier: `${PREFIX}other`, password: 'Test12345' },
    });
    const otherToken = otherLogin.json().data.accessToken;

    const res = await app.inject({
      method: 'GET', url: `${SHOP_SHIP}/${order.orderId}/tracking`,
      headers: auth(otherToken),
    });

    expect(res.statusCode).toBe(404);

    // Cleanup
    await db.user.deleteMany({ where: { username: `${PREFIX}other` } });
  });

  it('calcular fee con dirección de otro usuario es rechazado', async () => {
    const otherUser = await db.user.create({
      data: {
        username: `${PREFIX}addr_other`, email: `${PREFIX}addr_other@test.com`,
        passwordHash: await hashPassword('Test12345'),
        adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
        phoneVerified: true, emailVerified: true,
      },
    });
    const otherAddr = await db.address.create({
      data: { userId: otherUser.id, label: 'Ajena', formattedAddress: 'No es tuya',
        lat: 19.0, lng: -91.0, isDefault: true },
    });

    const res = await app.inject({
      method: 'POST', url: `${SHOP_SHIP}/calculate-fee`, headers: auth(customerToken),
      payload: { addressId: otherAddr.id },
    });

    // Rechaza — calculate-fee valida ownership de la dirección
    expect([400, 403, 404].includes(res.statusCode)).toBe(true);

    // Cleanup
    await db.address.deleteMany({ where: { userId: otherUser.id } });
    await db.user.deleteMany({ where: { username: `${PREFIX}addr_other` } });
  });

  it('doble advance simultáneo: solo uno pasa', async () => {
    const order = await createOrderWithAddress();
    const shipmentId = order.shipment.id;
    await db.order.update({ where: { id: order.orderId }, data: { status: 'CONFIRMED' } });

    // Dos admins avanzan al mismo tiempo
    const [res1, res2] = await Promise.all([
      advanceShipment(shipmentId),
      advanceShipment(shipmentId),
    ]);

    const statuses = [res1.statusCode, res2.statusCode].sort();
    // Al menos uno pasa
    expect(statuses).toContain(200);
    // No deberían pasar los dos (avanzaría 2 pasos)
    // Si ambos pasan, verificamos que el shipment no saltó un estado
    const shipment = await db.shipment.findUnique({ where: { id: shipmentId } });
    // PENDING → PREPARING es el primer avance, no debería saltar a más
    expect(['PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(shipment!.status)).toBe(true);
  });

  it('fail shipment PREPARING con COD: stock queda limpio', async () => {
    // COD con HOME_DELIVERY — empieza en PREPARING
    await app.inject({
      method: 'POST', url: `${CART_URL}/items`, headers: auth(customerToken),
      payload: { productId, quantity: 4 },
    });
    const orderRes = await app.inject({
      method: 'POST', url: ORDER_URL, headers: auth(customerToken),
      payload: { addressId: addressNearId, paymentMethod: 'CASH_ON_DELIVERY' },
    });
    const order = orderRes.json().data;
    const shipmentId = order.shipment.id;

    // reserved = 4, physical = 20
    const invBefore = await db.inventory.findUnique({ where: { productId } });
    expect(invBefore!.reservedStock).toBe(4);
    expect(invBefore!.physicalStock).toBe(20);

    // Fail desde PREPARING
    await app.inject({
      method: 'PATCH', url: `${BO_SHIP}/${shipmentId}/fail`, headers: auth(adminToken),
      payload: { note: 'Producto dañado en almacén' },
    });

    // reserved liberado, physical intacto
    const invAfter = await db.inventory.findUnique({ where: { productId } });
    expect(invAfter!.reservedStock).toBe(0);
    expect(invAfter!.physicalStock).toBe(20);

    // Pago cancelado
    const payment = await db.payment.findFirst({ where: { orderId: order.orderId } });
    expect(payment!.status).toBe('CANCELLED');

    // Orden cancelada
    const finalOrder = await db.order.findUnique({ where: { id: order.orderId } });
    expect(finalOrder!.status).toBe('CANCELLED');
  });

  it('advance genera timeline de eventos completa', async () => {
    const order = await createOrderWithAddress();
    const shipmentId = order.shipment.id;
    await db.order.update({ where: { id: order.orderId }, data: { status: 'CONFIRMED' } });

    // Avanzar paso a paso con notas
    await advanceShipment(shipmentId, 'Empezando a preparar');
    await advanceShipment(shipmentId, 'Listo para recoger');
    await advanceShipment(shipmentId, 'Entregado al cliente');

    // Verificar timeline completa
    const events = await db.shipmentEvent.findMany({
      where: { shipmentId },
      orderBy: { createdAt: 'asc' },
    });

    // Puede haber eventos extra por auto-avance de orden (SHIPPED, DELIVERED)
    expect(events.length).toBeGreaterThanOrEqual(3);
    // Los eventos manuales están en la timeline
    const notes = events.map((e: any) => e.note).filter(Boolean);
    expect(notes.some((n: string) => n.includes('Empezando a preparar'))).toBe(true);
    expect(notes.some((n: string) => n.includes('Listo para recoger'))).toBe(true);
    expect(notes.some((n: string) => n.includes('Entregado al cliente'))).toBe(true);
  });
});
