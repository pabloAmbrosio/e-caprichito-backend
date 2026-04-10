import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { buildServer } from '../../server';
import { db } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

let ownerToken: string;
let customerToken: string;
let categoryId: string;

const BO_URL = '/api/backoffice/products';

beforeAll(async () => {
  await app.ready();

  // Limpiar
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-bo-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-bo-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-bo-' } } });
  await db.category.deleteMany({ where: { slug: 'test-bo-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_bo_' } } });

  // Owner
  const owner = await db.user.create({
    data: {
      username: 'test_bo_owner',
      email: 'test_bo_owner@test.com',
      phone: '+15557770001',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.OWNER,
      customerRole: CustomerRole.MEMBER,
      phoneVerified: true,
      emailVerified: true,
    },
  });
  const ownerLogin = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: owner.username, password: 'Test12345' },
  });
  ownerToken = ownerLogin.json().data.accessToken;

  // Customer (sin permisos)
  const customer = await db.user.create({
    data: {
      username: 'test_bo_customer',
      email: 'test_bo_customer@test.com',
      phone: '+15557770002',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER,
      customerRole: CustomerRole.MEMBER,
      phoneVerified: true,
      emailVerified: true,
    },
  });
  const customerLogin = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: customer.username, password: 'Test12345' },
  });
  customerToken = customerLogin.json().data.accessToken;

  // Categoría
  const cat = await db.category.create({
    data: { name: 'Test BO Cat', slug: 'test-bo-cat', sortOrder: 99 },
  });
  categoryId = cat.id;
});

afterAll(async () => {
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-bo-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-bo-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-bo-' } } });
  await db.category.deleteMany({ where: { slug: 'test-bo-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_bo_' } } });
  await app.close();
  await redisClient.quit();
});

// Helper: crear producto rápido
function initProduct(overrides: Record<string, any> = {}) {
  return app.inject({
    method: 'POST',
    url: BO_URL,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: {
      title: 'Test BO Producto',
      description: 'Descripción de test',
      categoryId,
      tags: ['test', 'bo'],
      variants: [{
        title: 'Variante Principal',
        sku: `TEST-BO-${Date.now()}`,
        priceInCents: 35000,
        details: { color: 'rojo' },
        stock: 10,
      }],
      ...overrides,
    },
  });
}

// ─── INICIALIZAR PRODUCTO ──────────────────────────────────────

describe('POST /api/backoffice/products (initialize)', () => {
  it('crea abstract product + variante en una operación', async () => {
    const res = await initProduct({
      title: 'Test BO Vestido Rojo',
      slug: 'test-bo-vestido-rojo',
      variants: [{
        title: 'Vestido Rojo Unitalla',
        sku: 'TEST-BO-VR-001',
        priceInCents: 45000,
        details: { color: 'rojo', talla: 'unitalla' },
        stock: 5,
      }],
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.abstractProduct).toBeDefined();
    expect(body.data.abstractProduct.title).toBe('Test BO Vestido Rojo');
    expect(body.data.abstractProduct.slug).toBe('test-bo-vestido-rojo');
    expect(body.data.variants.length).toBe(1);
    expect(body.data.variants[0].sku).toBe('TEST-BO-VR-001');
    expect(body.data.variants[0].priceInCents).toBe(45000);
  });

  it('slug se autogenera si no se manda', async () => {
    const res = await initProduct({
      title: 'Test BO Auto Slug',
      variants: [{
        title: 'Variante Auto',
        sku: 'TEST-BO-AS-001',
        priceInCents: 20000,
        details: {},
        stock: 1,
      }],
    });

    expect(res.statusCode).toBe(201);
    const slug = res.json().data.abstractProduct.slug;
    expect(slug).toBeDefined();
    expect(slug.length).toBeGreaterThan(0);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('rechaza SKU duplicado', async () => {
    await initProduct({
      title: 'Test BO Dup1',
      slug: 'test-bo-dup1',
      variants: [{
        title: 'V1', sku: 'TEST-BO-DUP-SKU', priceInCents: 10000, details: {}, stock: 1,
      }],
    });

    const res = await initProduct({
      title: 'Test BO Dup2',
      slug: 'test-bo-dup2',
      variants: [{
        title: 'V2', sku: 'TEST-BO-DUP-SKU', priceInCents: 10000, details: {}, stock: 1,
      }],
    });

    expect(res.statusCode).toBe(409);
  });

  it('CUSTOMER no puede crear productos', async () => {
    const res = await app.inject({
      method: 'POST',
      url: BO_URL,
      headers: { authorization: `Bearer ${customerToken}` },
      payload: {
        title: 'Nope', description: 'Nope', categoryId,
        tags: ['nope'],
        variants: [{ title: 'N', sku: 'NOPE-001', priceInCents: 1000, details: {}, stock: 0 }],
      },
    });

    expect(res.statusCode).toBe(403);
  });
});

// ─── OBTENER Y ACTUALIZAR ──────────────────────────────────────

describe('GET y PATCH /api/backoffice/products/:id', () => {
  let productId: string;

  beforeAll(async () => {
    const res = await initProduct({
      title: 'Test BO Para Editar',
      slug: 'test-bo-para-editar',
      variants: [{
        title: 'Var Editar', sku: 'TEST-BO-EDIT-001', priceInCents: 30000, details: { talla: 'M' }, stock: 8,
      }],
    });
    productId = res.json().data.abstractProduct.id;
  });

  it('obtener producto por ID con variantes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `${BO_URL}/${productId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.title).toBe('Test BO Para Editar');
    expect(body.data.variants).toBeDefined();
    expect(body.data.variants.length).toBeGreaterThanOrEqual(1);
  });

  it('actualizar título, tags y descripción', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `${BO_URL}/${productId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        title: 'Test BO Editado',
        description: 'Descripción actualizada',
        tags: ['editado', 'nuevo-tag'],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.title).toBe('Test BO Editado');
    expect(body.data.description).toBe('Descripción actualizada');
    expect(body.data.tags).toContain('editado');
  });

  it('producto inexistente devuelve 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `${BO_URL}/00000000-0000-0000-0000-000000000000`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(404);
  });
});

// ─── STATUS MACHINE ────────────────────────────────────────────

describe('PATCH /api/backoffice/products/:id/status', () => {
  let productId: string;

  beforeAll(async () => {
    const res = await initProduct({
      title: 'Test BO Status',
      slug: 'test-bo-status',
      variants: [{
        title: 'Var Status', sku: 'TEST-BO-ST-001', priceInCents: 25000, details: {}, stock: 3,
      }],
    });
    productId = res.json().data.abstractProduct.id;
  });

  it('DRAFT → PUBLISHED', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `${BO_URL}/${productId}/status`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: { status: 'PUBLISHED' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.status).toBe('PUBLISHED');
  });

  it('PUBLISHED → ARCHIVED', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `${BO_URL}/${productId}/status`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: { status: 'ARCHIVED' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.status).toBe('ARCHIVED');
  });

  it('transición inválida ARCHIVED → PUBLISHED rechazada', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `${BO_URL}/${productId}/status`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: { status: 'PUBLISHED' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('INVALID_STATUS_TRANSITION');
  });
});

// ─── VARIANTES ─────────────────────────────────────────────────

describe('Variantes: agregar, actualizar, status, eliminar', () => {
  let productId: string;
  let variantId: string;

  beforeAll(async () => {
    const res = await initProduct({
      title: 'Test BO Variantes',
      slug: 'test-bo-variantes',
      variants: [{
        title: 'Var Original', sku: 'TEST-BO-VAR-001', priceInCents: 30000, details: { talla: 'S' }, stock: 5,
      }],
    });
    productId = res.json().data.abstractProduct.id;
  });

  it('agregar variante nueva a producto existente', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `${BO_URL}/${productId}/variants`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        variants: [{
          title: 'Var Nueva Talla M',
          sku: 'TEST-BO-VAR-002',
          priceInCents: 32000,
          details: { talla: 'M' },
          stock: 3,
        }],
      },
    });

    expect(res.statusCode).toBe(201);
    const variants = res.json().data.variants || res.json().data;
    // Guardar ID de la nueva variante para los siguientes tests
    const newVariant = Array.isArray(variants) ? variants.find((v: any) => v.sku === 'TEST-BO-VAR-002') : null;
    if (newVariant) variantId = newVariant.id;
  });

  it('actualizar precio de variante', async () => {
    // Si no tenemos variantId del test anterior, buscarlo
    if (!variantId) {
      const getRes = await app.inject({
        method: 'GET', url: `${BO_URL}/${productId}`,
        headers: { authorization: `Bearer ${ownerToken}` },
      });
      const v = getRes.json().data.variants.find((v: any) => v.sku === 'TEST-BO-VAR-002');
      variantId = v.id;
    }

    const res = await app.inject({
      method: 'PATCH',
      url: `${BO_URL}/${productId}/variants/${variantId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: { priceInCents: 38000 },
    });

    expect(res.statusCode).toBe(200);
    // La respuesta devuelve el abstract product completo
    const updatedVariant = res.json().data.variants.find((v: any) => v.id === variantId);
    expect(updatedVariant).toBeDefined();
    expect(updatedVariant.priceInCents).toBe(38000);
  });

  it('cambiar status de variante DRAFT → PUBLISHED', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `${BO_URL}/${productId}/variants/${variantId}/status`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: { status: 'PUBLISHED' },
    });

    expect(res.statusCode).toBe(200);
    // La respuesta devuelve el abstract product — buscar la variante dentro
    const updatedVariant = res.json().data.variants.find((v: any) => v.id === variantId);
    expect(updatedVariant).toBeDefined();
    expect(updatedVariant.status).toBe('PUBLISHED');
  });

  it('eliminar variante', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `${BO_URL}/${productId}/variants/${variantId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(200);
  });
});

// ─── ELIMINAR PRODUCTO ─────────────────────────────────────────

describe('DELETE /api/backoffice/products/:id', () => {
  it('soft delete de producto (incluye variantes)', async () => {
    const createRes = await initProduct({
      title: 'Test BO Para Borrar',
      slug: 'test-bo-para-borrar',
      variants: [{
        title: 'Var Borrar', sku: 'TEST-BO-DEL-001', priceInCents: 15000, details: {}, stock: 0,
      }],
    });
    const productId = createRes.json().data.abstractProduct.id;

    const res = await app.inject({
      method: 'DELETE',
      url: `${BO_URL}/${productId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(200);

    // Ya no se encuentra por GET
    const getRes = await app.inject({
      method: 'GET',
      url: `${BO_URL}/${productId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    expect(getRes.statusCode).toBe(404);
  });
});
