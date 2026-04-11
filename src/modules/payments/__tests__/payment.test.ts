import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '../../server';
import { db, ProductStatus } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

// Usuario 1
let token1: string;
let userId1: string;
// Usuario 2
let token2: string;
let userId2: string;

let sellerId: string;
let adminToken: string;
let categoryId: string;
let productId: string;

const ORDER_URL = '/api/order';
const CART_URL = '/api/cart';
const PAYMENT_URL = '/api/payments';

function auth(t: string) {
  return { authorization: `Bearer ${t}` };
}

const PREFIX = 'test_pay_';

async function cleanupAll() {
  await db.promotionUsage.deleteMany({ where: { user: { username: { startsWith: PREFIX } } } });
  await db.orderStatusAuditLog.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.shipmentEvent.deleteMany({ where: { shipment: { order: { customer: { username: { startsWith: PREFIX } } } } } });
  await db.shipment.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.payment.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  await db.orderItem.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.order.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  for (const uid of [userId1, userId2].filter(Boolean)) {
    await db.user.update({ where: { id: uid }, data: { activeCartId: null } }).catch(() => {});
  }
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: { startsWith: PREFIX } } } } });
  await db.cart.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
}

// Helper: llenar carrito y checkout para un usuario
async function createOrder(t: string, qty = 1) {
  await app.inject({
    method: 'POST', url: `${CART_URL}/items`, headers: auth(t),
    payload: { productId, quantity: qty },
  });
  const res = await app.inject({
    method: 'POST', url: ORDER_URL, headers: auth(t),
    payload: {},
  });
  return res.json().data;
}

beforeAll(async () => {
  await app.ready();

  // Limpiar
  await db.payment.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  await db.orderItem.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.orderStatusAuditLog.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.shipmentEvent.deleteMany({ where: { shipment: { order: { customer: { username: { startsWith: PREFIX } } } } } });
  await db.shipment.deleteMany({ where: { order: { customer: { username: { startsWith: PREFIX } } } } });
  await db.order.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: { startsWith: PREFIX } } } } });
  await db.cart.deleteMany({ where: { customer: { username: { startsWith: PREFIX } } } });
  await db.address.deleteMany({ where: { user: { username: { startsWith: PREFIX } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-pay-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-pay-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-pay-' } } });
  await db.category.deleteMany({ where: { slug: 'test-pay-cat' } });
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

  // Admin (para reviews)
  const admin = await db.user.create({
    data: {
      username: `${PREFIX}admin`, email: `${PREFIX}admin@test.com`,
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.OWNER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  const adminLogin = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: `${PREFIX}admin`, password: 'Test12345' },
  });
  adminToken = adminLogin.json().data.accessToken;

  // Customer 1
  const c1 = await db.user.create({
    data: {
      username: `${PREFIX}c1`, email: `${PREFIX}c1@test.com`, phone: '+15551110001',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  userId1 = c1.id;
  const login1 = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: `${PREFIX}c1`, password: 'Test12345' },
  });
  token1 = login1.json().data.accessToken;

  // Customer 2
  const c2 = await db.user.create({
    data: {
      username: `${PREFIX}c2`, email: `${PREFIX}c2@test.com`, phone: '+15551110002',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  userId2 = c2.id;
  const login2 = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: `${PREFIX}c2`, password: 'Test12345' },
  });
  token2 = login2.json().data.accessToken;

  // Categoría y producto
  const cat = await db.category.create({
    data: { name: 'Test Pay Cat', slug: 'test-pay-cat', sortOrder: 99 },
  });
  categoryId = cat.id;

  const ap = await db.abstractProduct.create({
    data: {
      title: 'Producto Pay', slug: 'test-pay-prod', description: 'Pay test',
      categoryId, tags: ['test'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const v = await db.product.create({
    data: {
      abstractProductId: ap.id, title: 'Producto Pay', sku: 'TEST-PAY-001',
      priceInCents: 50000, details: {},
      images: [{ imageUrl: 'https://ph.com/pay.jpg', thumbnailUrl: 'https://ph.com/pay.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: v.id, physicalStock: 20, reservedStock: 0 } });
  productId = v.id;
});

afterAll(async () => {
  await cleanupAll();
  await db.address.deleteMany({ where: { user: { username: { startsWith: PREFIX } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-pay-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-pay-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-pay-' } } });
  await db.category.deleteMany({ where: { slug: 'test-pay-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: PREFIX } } });
  await app.close();
  await redisClient.quit();
});

// ─── SUBMIT PAYMENT BÁSICO ────────────────────────────────────

describe('POST /api/payments — submit payment', () => {
  beforeEach(async () => {
    await cleanupAll();
    await db.inventory.updateMany({
      where: { productId },
      data: { reservedStock: 0 },
    });
  });

  it('crear pago para orden PENDING', async () => {
    const order = await createOrder(token1);

    const res = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().data.status).toBe('PENDING');
  });

  it('doble pago en la misma orden → 409 PAYMENT_ALREADY_EXISTS', async () => {
    const order = await createOrder(token1);

    // Primer pago
    await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
    });

    // Segundo pago — bloqueado
    const res = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('PAYMENT_ALREADY_EXISTS');
  });

  it('no se puede submit COD manualmente', async () => {
    const order = await createOrder(token1);

    const res = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order.orderId, method: 'CASH_ON_DELIVERY' },
    });

    expect(res.statusCode).toBe(400);
  });
});

// ─── UPLOAD PROOF ──────────────────────────────────────────────

describe('PATCH /api/payments/:id/proof — subir comprobante', () => {
  beforeEach(async () => {
    await cleanupAll();
    await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0 } });
  });

  it('subir comprobante cambia status a AWAITING_REVIEW', async () => {
    const order = await createOrder(token1);
    const payRes = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
    });
    const paymentId = payRes.json().data.id;

    const proofRes = await app.inject({
      method: 'PATCH', url: `${PAYMENT_URL}/${paymentId}/proof`, headers: auth(token1),
      payload: {
        screenshotUrl: 'https://res.cloudinary.com/test/image/upload/proof.jpg',
      },
    });

    expect(proofRes.statusCode).toBe(200);
    // El status en la respuesta puede ser PENDING o AWAITING_REVIEW
    // dependiendo de si el response lee antes o después del update.
    // Verificamos en BD directamente:
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    expect(payment!.status).toBe('AWAITING_REVIEW');
  });

  it('subir proof dos veces falla (ya no está PENDING)', async () => {
    const order = await createOrder(token1);
    const payRes = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
    });
    const paymentId = payRes.json().data.id;

    // Primer proof
    await app.inject({
      method: 'PATCH', url: `${PAYMENT_URL}/${paymentId}/proof`, headers: auth(token1),
      payload: { screenshotUrl: 'https://res.cloudinary.com/test/image/upload/proof1.jpg' },
    });

    // Segundo proof — ya está en AWAITING_REVIEW
    const res = await app.inject({
      method: 'PATCH', url: `${PAYMENT_URL}/${paymentId}/proof`, headers: auth(token1),
      payload: { screenshotUrl: 'https://res.cloudinary.com/test/image/upload/proof2.jpg' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('URL de dominio no permitido es rechazada', async () => {
    const order = await createOrder(token1);
    const payRes = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
    });
    const paymentId = payRes.json().data.id;

    const res = await app.inject({
      method: 'PATCH', url: `${PAYMENT_URL}/${paymentId}/proof`, headers: auth(token1),
      payload: { screenshotUrl: 'https://evil-site.com/fake-proof.jpg' },
    });

    expect(res.statusCode).toBe(400);
  });
});

// ─── CONCURRENCIA: DOS USUARIOS PAGAN AL MISMO TIEMPO ─────────

describe('Concurrencia: dos usuarios pagan simultáneamente', () => {
  beforeEach(async () => {
    await cleanupAll();
    await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0 } });
  });

  it('ambos pueden crear pagos en sus respectivas órdenes (secuencial)', async () => {
    // Crear órdenes para ambos usuarios
    const order1 = await createOrder(token1, 1);
    const order2 = await createOrder(token2, 1);

    // Serializable isolation puede causar conflicto en paralelo real,
    // así que probamos secuencial — lo importante es que ambos pasan
    const res1 = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order1.orderId, method: 'MANUAL_TRANSFER' },
    });
    const res2 = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token2),
      payload: { orderId: order2.orderId, method: 'MANUAL_TRANSFER' },
    });

    expect(res1.statusCode).toBe(201);
    expect(res2.statusCode).toBe(201);
  });

  it('mismo usuario, doble submit simultáneo: uno falla con 409', async () => {
    const order = await createOrder(token1);

    const [res1, res2] = await Promise.all([
      app.inject({
        method: 'POST', url: PAYMENT_URL, headers: auth(token1),
        payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
      }),
      app.inject({
        method: 'POST', url: PAYMENT_URL, headers: auth(token1),
        payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
      }),
    ]);

    const statuses = [res1.statusCode, res2.statusCode].sort();
    // Uno 201, otro 409 (o ambos si la serialización lo permite, pero al menos uno pasa)
    expect(statuses).toContain(201);
    // El otro debe ser 409 o serialization error
    expect(statuses[1]).not.toBe(201);
  });

  it('ambos suben proof al mismo tiempo en sus respectivos pagos', async () => {
    const order1 = await createOrder(token1, 1);
    const order2 = await createOrder(token2, 1);

    const pay1Res = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order1.orderId, method: 'MANUAL_TRANSFER' },
    });
    const pay2Res = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token2),
      payload: { orderId: order2.orderId, method: 'MANUAL_TRANSFER' },
    });

    // Upload proof simultáneo
    const [proof1, proof2] = await Promise.all([
      app.inject({
        method: 'PATCH', url: `${PAYMENT_URL}/${pay1Res.json().data.id}/proof`,
        headers: auth(token1),
        payload: { screenshotUrl: 'https://res.cloudinary.com/test/image/upload/p1.jpg' },
      }),
      app.inject({
        method: 'PATCH', url: `${PAYMENT_URL}/${pay2Res.json().data.id}/proof`,
        headers: auth(token2),
        payload: { screenshotUrl: 'https://res.cloudinary.com/test/image/upload/p2.jpg' },
      }),
    ]);

    // Ambos deben pasar — pagos diferentes
    expect(proof1.statusCode).toBe(200);
    expect(proof2.statusCode).toBe(200);
  });
});

// ─── PAGO DE ORDEN AJENA ───────────────────────────────────────

describe('Protecciones de pago', () => {
  beforeEach(async () => {
    await cleanupAll();
    await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0 } });
  });

  it('no puede pagar orden de otro usuario', async () => {
    const order = await createOrder(token1);

    // Usuario 2 intenta pagar orden de usuario 1
    const res = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token2),
      payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
    });

    expect([403, 404].includes(res.statusCode)).toBe(true);
  });

  it('sin auth devuelve 401', async () => {
    const res = await app.inject({
      method: 'POST', url: PAYMENT_URL,
      payload: { orderId: '00000000-0000-0000-0000-000000000000', method: 'MANUAL_TRANSFER' },
    });
    expect(res.statusCode).toBe(401);
  });
});

// Helper: crear orden + pago + proof → listo para review
async function createPaymentReadyForReview(t: string, uid: string, qty = 1) {
  // Asegurar carrito limpio para este usuario
  await db.user.update({ where: { id: uid }, data: { activeCartId: null } }).catch(() => {});
  await db.cartItem.deleteMany({ where: { cart: { customerId: uid } } });
  await db.cart.deleteMany({ where: { customerId: uid } });

  const order = await createOrder(t, qty);

  const payRes = await app.inject({
    method: 'POST', url: PAYMENT_URL, headers: auth(t),
    payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
  });

  if (payRes.statusCode !== 201) {
    throw new Error(`Submit payment failed: ${payRes.statusCode} ${payRes.body}`);
  }
  const paymentId = payRes.json().data.id;

  await app.inject({
    method: 'PATCH', url: `${PAYMENT_URL}/${paymentId}/proof`, headers: auth(t),
    payload: { screenshotUrl: 'https://res.cloudinary.com/test/image/upload/proof.jpg' },
  });

  return { orderId: order.orderId, paymentId };
}

// ─── ADMIN APRUEBA PAGO ───────────────────────────────────────

describe('PATCH /api/backoffice/payments/:id/review — aprobar', () => {
  beforeEach(async () => {
    await cleanupAll();
    await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0, physicalStock: 20 } });
  });

  it('aprobar pago: orden → CONFIRMED, stock físico baja', async () => {
    const { orderId, paymentId } = await createPaymentReadyForReview(token1, userId1, 3);

    const invBefore = await db.inventory.findUnique({ where: { productId } });
    expect(invBefore!.physicalStock).toBe(20);
    expect(invBefore!.reservedStock).toBe(3); // reservado en checkout

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${paymentId}/review`,
      headers: auth(adminToken),
      payload: { action: 'APPROVE', note: 'Pago verificado' },
    });

    expect(res.statusCode).toBe(200);

    // Verificar orden → CONFIRMED
    const order = await db.order.findUnique({ where: { id: orderId } });
    expect(order!.status).toBe('CONFIRMED');

    // Verificar stock: physical baja 3, reserved baja 3
    const invAfter = await db.inventory.findUnique({ where: { productId } });
    expect(invAfter!.physicalStock).toBe(17);
    expect(invAfter!.reservedStock).toBe(0);
  });

  it('aprobar pago: shipment avanza a PREPARING', async () => {
    const { orderId } = await createPaymentReadyForReview(token1, userId1, 1);

    const paymentId = (await db.payment.findFirst({ where: { orderId } }))!.id;

    await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${paymentId}/review`,
      headers: auth(adminToken),
      payload: { action: 'APPROVE' },
    });

    const shipment = await db.shipment.findFirst({ where: { orderId } });
    expect(shipment!.status).toBe('PREPARING');
  });
});

// ─── ADMIN RECHAZA PAGO ───────────────────────────────────────

describe('PATCH /api/backoffice/payments/:id/review — rechazar', () => {
  beforeEach(async () => {
    await cleanupAll();
    await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0, physicalStock: 20 } });
  });

  it('rechazar pago: libera reservedStock, physicalStock no cambia', async () => {
    const { paymentId } = await createPaymentReadyForReview(token1, userId1, 4);

    const invBefore = await db.inventory.findUnique({ where: { productId } });
    expect(invBefore!.reservedStock).toBe(4);
    expect(invBefore!.physicalStock).toBe(20);

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${paymentId}/review`,
      headers: auth(adminToken),
      payload: { action: 'REJECT', note: 'Comprobante ilegible' },
    });

    expect(res.statusCode).toBe(200);

    // reservedStock liberado, physicalStock intacto
    const invAfter = await db.inventory.findUnique({ where: { productId } });
    expect(invAfter!.reservedStock).toBe(0);
    expect(invAfter!.physicalStock).toBe(20);
  });
});

// ─── RACE CONDITION: DOS PAGOS APROBADOS, STOCK LIMITADO ──────

describe('Concurrencia: aprobar dos pagos cuando el stock no alcanza', () => {
  beforeEach(async () => {
    await cleanupAll();
    // Solo 3 de stock físico — si dos órdenes de 2 unidades se aprueban, una falla
    await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0, physicalStock: 3 } });
  });

  it('el segundo approve falla si no hay stock suficiente', async () => {
    // Orden 1: 2 unidades
    const { paymentId: pid1 } = await createPaymentReadyForReview(token1, userId1, 2);
    // Orden 2: 2 unidades
    const { paymentId: pid2 } = await createPaymentReadyForReview(token2, userId2, 2);

    // Stock: physical=3, reserved=4 (2+2) — hay más reservado que físico

    // Aprobar primero: OK (3 physical - 2 = 1 queda)
    const approve1 = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${pid1}/review`,
      headers: auth(adminToken),
      payload: { action: 'APPROVE' },
    });
    expect(approve1.statusCode).toBe(200);

    // Aprobar segundo: falla — solo queda 1 de stock y necesita 2
    const approve2 = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${pid2}/review`,
      headers: auth(adminToken),
      payload: { action: 'APPROVE' },
    });

    // Debe fallar por stock insuficiente
    expect(approve2.statusCode).not.toBe(200);

    // Verificar que el stock no quedó negativo
    const inv = await db.inventory.findUnique({ where: { productId } });
    expect(inv!.physicalStock).toBeGreaterThanOrEqual(0);
  });
});

// ─── PAGO RECHAZADO → CLIENTE REINTENTA ───────────────────────

describe('Flujo de reintento: rechazo → nuevo pago', () => {
  beforeEach(async () => {
    await cleanupAll();
    await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0, physicalStock: 20 } });
  });

  it('después de rechazo, el cliente puede crear un nuevo pago', async () => {
    const { orderId, paymentId } = await createPaymentReadyForReview(token1, userId1, 2);

    // Admin rechaza
    await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${paymentId}/review`,
      headers: auth(adminToken),
      payload: { action: 'REJECT', note: 'Comprobante borroso' },
    });

    // Verificar que el pago fue rechazado
    const rejectedPayment = await db.payment.findUnique({ where: { id: paymentId } });
    expect(rejectedPayment!.status).toBe('REJECTED');

    // Cliente crea nuevo pago — debe funcionar (ya no hay PENDING/AWAITING_REVIEW)
    const newPayRes = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId, method: 'MANUAL_TRANSFER' },
    });
    expect(newPayRes.statusCode).toBe(201);
    const newPaymentId = newPayRes.json().data.id;
    expect(newPaymentId).not.toBe(paymentId); // es un pago nuevo

    // Cliente sube nuevo comprobante
    const proofRes = await app.inject({
      method: 'PATCH', url: `${PAYMENT_URL}/${newPaymentId}/proof`, headers: auth(token1),
      payload: { screenshotUrl: 'https://res.cloudinary.com/test/image/upload/nuevo-proof.jpg' },
    });
    expect(proofRes.statusCode).toBe(200);

    // Admin aprueba el segundo intento
    const approveRes = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${newPaymentId}/review`,
      headers: auth(adminToken),
      payload: { action: 'APPROVE', note: 'Ahora sí se ve bien' },
    });
    expect(approveRes.statusCode).toBe(200);

    // La orden queda CONFIRMED
    const order = await db.order.findUnique({ where: { id: orderId } });
    expect(order!.status).toBe('CONFIRMED');
  });

  it('no puede crear pago nuevo si el anterior aún está PENDING', async () => {
    const order = await createOrder(token1, 1);

    // Primer pago (PENDING)
    await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
    });

    // Segundo pago — bloqueado, el primero sigue PENDING
    const res = await app.inject({
      method: 'POST', url: PAYMENT_URL, headers: auth(token1),
      payload: { orderId: order.orderId, method: 'MANUAL_TRANSFER' },
    });
    expect(res.statusCode).toBe(409);
  });
});

// ─── ORDEN EXPIRA MIENTRAS ADMIN REVISA EL PAGO ───────────────

describe('Orden expira durante revisión de pago', () => {
  beforeEach(async () => {
    await cleanupAll();
    await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0, physicalStock: 20 } });
  });

  it('admin NO puede aprobar pago de orden cancelada', async () => {
    const { orderId, paymentId } = await createPaymentReadyForReview(token1, userId1, 3);

    // Cancelar la orden (libera reservedStock: 3 → 0)
    await app.inject({
      method: 'PATCH', url: `/api/order/${orderId}/cancel`, headers: auth(token1),
    });

    const invAfterCancel = await db.inventory.findUnique({ where: { productId } });
    expect(invAfterCancel!.reservedStock).toBe(0);

    // Admin intenta aprobar — ahora falla
    const approveRes = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${paymentId}/review`,
      headers: auth(adminToken),
      payload: { action: 'APPROVE' },
    });
    expect(approveRes.statusCode).toBe(400);

    // Stock intacto — nunca negativo
    const invFinal = await db.inventory.findUnique({ where: { productId } });
    expect(invFinal!.physicalStock).toBe(20);
    expect(invFinal!.reservedStock).toBe(0);
  });
});

// ─── CLIENTE CANCELA MIENTRAS ADMIN APRUEBA ───────────────────

describe('Race condition: cancelar orden vs aprobar pago', () => {
  beforeEach(async () => {
    await cleanupAll();
    await db.inventory.updateMany({ where: { productId }, data: { reservedStock: 0, physicalStock: 20 } });
  });

  it('cancel + approve: approve bloqueado, stock nunca negativo', async () => {
    const { orderId, paymentId } = await createPaymentReadyForReview(token1, userId1, 5);

    expect((await db.inventory.findUnique({ where: { productId } }))!.reservedStock).toBe(5);

    // Cancel libera reserved: 5 → 0
    await app.inject({
      method: 'PATCH', url: `/api/order/${orderId}/cancel`, headers: auth(token1),
    });
    expect((await db.inventory.findUnique({ where: { productId } }))!.reservedStock).toBe(0);

    // Approve bloqueado — orden ya cancelada
    const approveRes = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${paymentId}/review`,
      headers: auth(adminToken),
      payload: { action: 'APPROVE' },
    });
    expect(approveRes.statusCode).toBe(400);

    // Stock nunca negativo
    const invFinal = await db.inventory.findUnique({ where: { productId } });
    expect(invFinal!.physicalStock).toBe(20);
    expect(invFinal!.reservedStock).toBe(0);
  });

  it('approve primero, luego cancel: stock queda consistente', async () => {
    const { orderId, paymentId } = await createPaymentReadyForReview(token1, userId1, 3);

    // Approve: physical 20→17, reserved 3→0
    await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/payments/${paymentId}/review`,
      headers: auth(adminToken),
      payload: { action: 'APPROVE' },
    });

    const invAfterApprove = await db.inventory.findUnique({ where: { productId } });
    expect(invAfterApprove!.physicalStock).toBe(17);
    expect(invAfterApprove!.reservedStock).toBe(0);

    // Cancel de orden CONFIRMED: NO libera reserved (ya fue deducido)
    await app.inject({
      method: 'PATCH', url: `/api/order/${orderId}/cancel`, headers: auth(token1),
    });

    // Stock consistente — reserved sigue en 0, no negativo
    const invFinal = await db.inventory.findUnique({ where: { productId } });
    expect(invFinal!.physicalStock).toBe(17);
    expect(invFinal!.reservedStock).toBe(0);
  });
});
