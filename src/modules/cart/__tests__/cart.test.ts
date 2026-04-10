import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '../../server';
import { db, ProductStatus } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

let token: string;
let userId: string;
let productId1: string;
let productId2: string;
let productId3: string; // sin stock
let productIdDraft: string; // no publicado
let categoryId: string;
let sellerId: string;

const CART_URL = '/api/cart';

function auth() {
  return { authorization: `Bearer ${token}` };
}

async function cleanupCarts() {
  // Primero quitar referencia del user para evitar FK constraint
  await db.user.update({ where: { id: userId }, data: { activeCartId: null } });
  await db.cartItem.deleteMany({ where: { cart: { customerId: userId } } });
  await db.cart.deleteMany({ where: { customerId: userId } });
}

// Helper: agregar item al carrito
function addItem(productId: string, quantity: number) {
  return app.inject({
    method: 'POST', url: `${CART_URL}/items`, headers: auth(),
    payload: { productId, quantity },
  });
}

// Helper: obtener carrito actual
async function getCart() {
  const res = await app.inject({ method: 'GET', url: CART_URL, headers: auth() });
  return res.json();
}

beforeAll(async () => {
  await app.ready();

  // Limpiar
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: { startsWith: 'test_cart_' } } } } });
  await db.cart.deleteMany({ where: { customer: { username: { startsWith: 'test_cart_' } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-cart-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-cart-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-cart-' } } });
  await db.category.deleteMany({ where: { slug: 'test-cart-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_cart_' } } });

  const seller = await db.user.create({
    data: {
      username: 'test_cart_seller', email: 'test_cart_seller@test.com',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.SELLER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  sellerId = seller.id;

  const customer = await db.user.create({
    data: {
      username: 'test_cart_customer', email: 'test_cart_customer@test.com',
      phone: '+15556660001', passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  userId = customer.id;

  const loginRes = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: 'test_cart_customer', password: 'Test12345' },
  });
  token = loginRes.json().data.accessToken;

  const cat = await db.category.create({
    data: { name: 'Test Cart Cat', slug: 'test-cart-cat', sortOrder: 99 },
  });
  categoryId = cat.id;

  // Producto 1: stock abundante
  const ap1 = await db.abstractProduct.create({
    data: {
      title: 'Producto Cart Stock', slug: 'test-cart-stock', description: 'Con stock',
      categoryId, tags: ['test'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const v1 = await db.product.create({
    data: {
      abstractProductId: ap1.id, title: 'Producto Cart Stock', sku: 'TEST-CART-001',
      priceInCents: 25000, details: {},
      images: [{ imageUrl: 'https://ph.com/1.jpg', thumbnailUrl: 'https://ph.com/1.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: v1.id, physicalStock: 20, reservedStock: 0 } });
  productId1 = v1.id;

  // Producto 2: stock limitado
  const ap2 = await db.abstractProduct.create({
    data: {
      title: 'Producto Cart Limitado', slug: 'test-cart-limitado', description: 'Poco stock',
      categoryId, tags: ['test'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const v2 = await db.product.create({
    data: {
      abstractProductId: ap2.id, title: 'Producto Cart Limitado', sku: 'TEST-CART-002',
      priceInCents: 45000, details: {},
      images: [{ imageUrl: 'https://ph.com/2.jpg', thumbnailUrl: 'https://ph.com/2.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: v2.id, physicalStock: 3, reservedStock: 0 } });
  productId2 = v2.id;

  // Producto 3: sin stock
  const ap3 = await db.abstractProduct.create({
    data: {
      title: 'Producto Cart Agotado', slug: 'test-cart-agotado', description: 'Sin stock',
      categoryId, tags: ['test'], status: ProductStatus.PUBLISHED,
      publishedAt: new Date(), createdBy: sellerId,
    },
  });
  const v3 = await db.product.create({
    data: {
      abstractProductId: ap3.id, title: 'Producto Cart Agotado', sku: 'TEST-CART-003',
      priceInCents: 15000, details: {},
      images: [{ imageUrl: 'https://ph.com/3.jpg', thumbnailUrl: 'https://ph.com/3.jpg' }],
      status: ProductStatus.PUBLISHED, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: v3.id, physicalStock: 0, reservedStock: 0 } });
  productId3 = v3.id;

  // Producto 4: DRAFT (no publicado)
  const ap4 = await db.abstractProduct.create({
    data: {
      title: 'Producto Cart Draft', slug: 'test-cart-draft', description: 'No publicado',
      categoryId, tags: ['test'], status: ProductStatus.DRAFT,
      createdBy: sellerId,
    },
  });
  const v4 = await db.product.create({
    data: {
      abstractProductId: ap4.id, title: 'Producto Cart Draft', sku: 'TEST-CART-004',
      priceInCents: 10000, details: {},
      images: [{ imageUrl: 'https://ph.com/4.jpg', thumbnailUrl: 'https://ph.com/4.jpg' }],
      status: ProductStatus.DRAFT, createdBy: sellerId,
    },
  });
  await db.inventory.create({ data: { productId: v4.id, physicalStock: 10, reservedStock: 0 } });
  productIdDraft = v4.id;
});

afterAll(async () => {
  await db.cartItem.deleteMany({ where: { cart: { customer: { username: { startsWith: 'test_cart_' } } } } });
  await db.cart.deleteMany({ where: { customer: { username: { startsWith: 'test_cart_' } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-cart-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-cart-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-cart-' } } });
  await db.category.deleteMany({ where: { slug: 'test-cart-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_cart_' } } });
  await app.close();
  await redisClient.quit();
});

// ─── GET-OR-CREATE ─────────────────────────────────────────────

describe('GET /api/cart — obtener o crear', () => {
  beforeEach(() => cleanupCarts());

  it('crea un carrito vacío si no existe', async () => {
    const res = await app.inject({ method: 'GET', url: CART_URL, headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(res.json().success).toBe(true);
  });

  it('devuelve el mismo carrito en llamadas consecutivas', async () => {
    // Agregar un item para verificar persistencia
    await addItem(productId1, 1);
    const body1 = await getCart();
    const body2 = await getCart();
    // Mismo contenido = mismo carrito
    expect(body1.data.items.length).toBe(body2.data.items.length);
    expect(body1.data.items[0]?.selectedVariantId).toBe(body2.data.items[0]?.selectedVariantId);
  });
});

// ─── AGREGAR ITEMS ─────────────────────────────────────────────

describe('POST /api/cart/items — agregar', () => {
  beforeEach(() => cleanupCarts());

  it('agrega un producto al carrito', async () => {
    const res = await addItem(productId1, 2);
    expect(res.statusCode).toBe(200);
    expect(res.json().success).toBe(true);
  });

  it('incrementa cantidad si ya existe', async () => {
    await addItem(productId1, 2);
    await addItem(productId1, 3);

    const cart = await getCart();
    const item = cart.data.items.find((i: any) => i.selectedVariantId === productId1);
    expect(item.quantity).toBe(5);
  });

  it('rechaza producto sin stock', async () => {
    const res = await addItem(productId3, 1);
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('OUT_OF_STOCK');
  });

  it('rechaza producto inexistente', async () => {
    const res = await addItem('00000000-0000-0000-0000-000000000000', 1);
    expect(res.statusCode).toBe(404);
  });

  it('rechaza cantidad > 99 en schema', async () => {
    const res = await addItem(productId1, 100);
    expect(res.statusCode).toBe(400);
  });

  it('dos productos distintos conviven en el carrito', async () => {
    await addItem(productId1, 1);
    await addItem(productId2, 2);

    const cart = await getCart();
    expect(cart.data.items.length).toBe(2);
  });
});

// ─── ACTUALIZAR CANTIDAD ───────────────────────────────────────

describe('PATCH /api/cart/items/:productId — actualizar', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await addItem(productId1, 3);
  });

  it('actualiza la cantidad', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `${CART_URL}/items/${productId1}`, headers: auth(),
      payload: { quantity: 7 },
    });
    expect(res.statusCode).toBe(200);

    const cart = await getCart();
    const item = cart.data.items.find((i: any) => i.selectedVariantId === productId1);
    expect(item.quantity).toBe(7);
  });

  it('cantidad 0 elimina el item', async () => {
    await app.inject({
      method: 'PATCH', url: `${CART_URL}/items/${productId1}`, headers: auth(),
      payload: { quantity: 0 },
    });

    const cart = await getCart();
    const item = cart.data.items.find((i: any) => i.selectedVariantId === productId1);
    expect(item).toBeUndefined();
  });

  it('rechaza cantidad > 99', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `${CART_URL}/items/${productId1}`, headers: auth(),
      payload: { quantity: 100 },
    });
    expect(res.statusCode).toBe(400);
  });
});

// ─── ELIMINAR ITEM ─────────────────────────────────────────────

describe('DELETE /api/cart/items/:productId', () => {
  beforeEach(async () => {
    await cleanupCarts();
    await addItem(productId1, 2);
  });

  it('elimina el item del carrito', async () => {
    const res = await app.inject({
      method: 'DELETE', url: `${CART_URL}/items/${productId1}`, headers: auth(),
    });
    expect(res.statusCode).toBe(200);

    const cart = await getCart();
    const item = cart.data.items.find((i: any) => i.selectedVariantId === productId1);
    expect(item).toBeUndefined();
  });
});

// ─── LÍMITE 50 ITEMS ───────────────────────────────────────────

describe('Límite de 50 items distintos', () => {
  beforeEach(() => cleanupCarts());

  it('el item 51 es rechazado', async () => {
    // Asegurar carrito limpio
    await cleanupCarts();

    // Crear 51 productos sin inventory (= stock ilimitado)
    const ids: string[] = [];
    for (let i = 0; i < 51; i++) {
      const ap = await db.abstractProduct.create({
        data: {
          title: `Bulk ${i}`, slug: `test-cart-bulk-${i}`, description: 'B',
          categoryId, tags: ['bulk'], status: ProductStatus.PUBLISHED,
          publishedAt: new Date(), createdBy: sellerId,
        },
      });
      const v = await db.product.create({
        data: {
          abstractProductId: ap.id, title: `Bulk ${i}`, sku: `TCBULK-${i}`,
          priceInCents: 1000, details: {}, status: ProductStatus.PUBLISHED, createdBy: sellerId,
        },
      });
      ids.push(v.id);
    }

    // Agregar 50 — todos deben pasar
    for (let i = 0; i < 50; i++) {
      await addItem(ids[i], 1);
    }

    // Verificar que hay 50 items
    const cart = await getCart();
    expect(cart.data.items.length).toBe(50);

    // El 51 debe fallar
    const res51 = await addItem(ids[50], 1);
    expect(res51.statusCode).toBe(400);
    expect(res51.json().error).toBe('MAX_ITEMS_EXCEEDED');

    // Cleanup: cart items primero, luego productos
    await cleanupCarts();
    await db.product.deleteMany({ where: { sku: { startsWith: 'TCBULK-' } } });
    await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-cart-bulk-' } } });
  });
});

// ─── ARCHIVAR Y RESTAURAR ──────────────────────────────────────

describe('Archivar y restaurar carrito', () => {
  beforeEach(() => cleanupCarts());

  it('DELETE /cart archiva y el siguiente GET da carrito nuevo vacío', async () => {
    await addItem(productId1, 2);
    const cartBefore = await getCart();
    expect(cartBefore.data.items.length).toBe(1);

    await app.inject({ method: 'DELETE', url: CART_URL, headers: auth() });

    const cartAfter = await getCart();
    expect(cartAfter.data.items.length).toBe(0);
  });

  it('restaurar carrito archivado lo activa con sus items', async () => {
    await addItem(productId1, 3);
    await addItem(productId2, 1);

    // Obtener el cartId del user
    const user = await db.user.findUnique({ where: { id: userId }, select: { activeCartId: true } });
    const oldCartId = user!.activeCartId!;

    // Archivar
    await app.inject({ method: 'DELETE', url: CART_URL, headers: auth() });

    // Restaurar
    const restoreRes = await app.inject({
      method: 'POST',
      url: `/api/carts/${oldCartId}/restore`,
      headers: auth(),
      payload: { cartId: oldCartId },
    });
    expect(restoreRes.statusCode).toBe(200);

    const cartAfter = await getCart();
    expect(cartAfter.data.items.length).toBe(2);
  });
});

// ─── VALIDACIÓN ────────────────────────────────────────────────

describe('GET /api/cart/validate', () => {
  beforeEach(() => cleanupCarts());

  it('carrito válido con items en stock', async () => {
    await addItem(productId1, 2);

    const res = await app.inject({
      method: 'GET', url: `${CART_URL}/validate`, headers: auth(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.valid).toBe(true);
    expect(res.json().data.issues.length).toBe(0);
  });

  it('carrito vacío es inválido', async () => {
    // Crear carrito vacío
    await getCart();

    const res = await app.inject({
      method: 'GET', url: `${CART_URL}/validate`, headers: auth(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.valid).toBe(false);
  });

  it('detecta producto agotado después de agregar', async () => {
    await addItem(productId2, 1);

    // Agotar stock
    await db.inventory.updateMany({
      where: { productId: productId2 },
      data: { reservedStock: 3 },
    });

    const res = await app.inject({
      method: 'GET', url: `${CART_URL}/validate`, headers: auth(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.issues.some((i: any) => i.type === 'OUT_OF_STOCK')).toBe(true);

    // Restaurar
    await db.inventory.updateMany({
      where: { productId: productId2 },
      data: { reservedStock: 0 },
    });
  });

  it('detecta producto eliminado (soft delete)', async () => {
    await addItem(productId1, 1);

    await db.product.update({
      where: { id: productId1 },
      data: { deletedAt: new Date() },
    });

    const res = await app.inject({
      method: 'GET', url: `${CART_URL}/validate`, headers: auth(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.issues.some((i: any) => i.type === 'PRODUCT_UNAVAILABLE')).toBe(true);

    await db.product.update({
      where: { id: productId1 },
      data: { deletedAt: null },
    });
  });
});

// ─── SUMMARY ───────────────────────────────────────────────────

describe('GET /api/cart/summary', () => {
  beforeEach(() => cleanupCarts());

  it('devuelve resumen del carrito', async () => {
    await addItem(productId1, 3);
    await addItem(productId2, 1);

    const res = await app.inject({
      method: 'GET', url: `${CART_URL}/summary`, headers: auth(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data).toBeDefined();
  });
});

// ─── EDGE CASES ────────────────────────────────────────────────

describe('Edge cases', () => {
  beforeEach(() => cleanupCarts());

  it('sin autenticación devuelve 401', async () => {
    const res = await app.inject({ method: 'GET', url: CART_URL });
    expect(res.statusCode).toBe(401);
  });

  it('agregar producto DRAFT: el carrito no valida status al agregar', async () => {
    // El carrito permite agregar productos DRAFT — la validación de status
    // es responsabilidad del checkout, no del carrito.
    const addRes = await addItem(productIdDraft, 1);
    expect(addRes.statusCode).toBe(200);

    const cart = await getCart();
    expect(cart.data.items.length).toBe(1);
  });

  it('eliminar item que no está en el carrito', async () => {
    // Crear carrito vacío
    await getCart();

    const res = await app.inject({
      method: 'DELETE',
      url: `${CART_URL}/items/${productId1}`,
      headers: auth(),
    });

    // Puede ser 404 (not found) o 200 (idempotente)
    expect([200, 404].includes(res.statusCode)).toBe(true);
  });

  it('bulk add: agregar varios items a la vez', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `${CART_URL}/items/bulk`,
      headers: auth(),
      payload: {
        items: [
          { productId: productId1, quantity: 2 },
          { productId: productId2, quantity: 1 },
        ],
      },
    });

    expect(res.statusCode).toBe(200);

    const cart = await getCart();
    expect(cart.data.items.length).toBe(2);
  });

  it('bulk add: rechaza si uno de los productos no tiene stock', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `${CART_URL}/items/bulk`,
      headers: auth(),
      payload: {
        items: [
          { productId: productId1, quantity: 1 },
          { productId: productId3, quantity: 1 }, // sin stock
        ],
      },
    });

    // El bulk debería fallar por el producto sin stock
    expect([409, 400].includes(res.statusCode)).toBe(true);
  });

  it('restaurar carrito activo es idempotente (no rompe nada)', async () => {
    await addItem(productId1, 1);
    const user = await db.user.findUnique({ where: { id: userId }, select: { activeCartId: true } });
    const activeCartId = user!.activeCartId!;

    // Restaurar carrito que ya está activo — el backend lo permite (idempotente)
    const res = await app.inject({
      method: 'POST',
      url: `/api/carts/${activeCartId}/restore`,
      headers: auth(),
      payload: { cartId: activeCartId },
    });

    expect(res.statusCode).toBe(200);

    // El carrito sigue intacto
    const cart = await getCart();
    expect(cart.data.items.length).toBe(1);
  });
});

// ─── CUPONES (pendiente de implementación en el front) ─────────

describe('Cupones', () => {
  beforeEach(() => cleanupCarts());

  // TODO: Los cupones existen en el backend pero el front no los usa todavía.
  // Cuando se decida implementar, descomentar y ajustar estos tests.

  // it('aplicar cupón válido al carrito', async () => {
  //   await addItem(productId1, 1);
  //   const res = await app.inject({
  //     method: 'POST', url: `${CART_URL}/coupon`, headers: auth(),
  //     payload: { couponCode: 'BIENVENIDA' },
  //   });
  //   expect(res.statusCode).toBe(200);
  // });

  // it('aplicar cupón inválido es rechazado', async () => {
  //   await addItem(productId1, 1);
  //   const res = await app.inject({
  //     method: 'POST', url: `${CART_URL}/coupon`, headers: auth(),
  //     payload: { couponCode: 'NOEXISTE' },
  //   });
  //   expect([400, 404].includes(res.statusCode)).toBe(true);
  // });

  // it('remover cupón del carrito', async () => {
  //   await addItem(productId1, 1);
  //   await app.inject({
  //     method: 'POST', url: `${CART_URL}/coupon`, headers: auth(),
  //     payload: { couponCode: 'BIENVENIDA' },
  //   });
  //   const res = await app.inject({
  //     method: 'DELETE', url: `${CART_URL}/coupon`, headers: auth(),
  //   });
  //   expect(res.statusCode).toBe(200);
  // });

  it('placeholder: cupones pendientes de decisión', () => {
    // Cupones están implementados en backend pero no se usan en el front.
    // Ver tests comentados arriba cuando se decida activarlos.
    expect(true).toBe(true);
  });
});
