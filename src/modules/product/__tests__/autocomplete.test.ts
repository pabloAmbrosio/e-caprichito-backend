import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../server';
import { db, ProductStatus } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

const BASE_URL = '/api/products/autocomplete';

function autocomplete(query: string) {
  return app.inject({ method: 'GET', url: `${BASE_URL}?${query}` });
}

beforeAll(async () => {
  await app.ready();

  // Limpiar datos previos
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-ac-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-ac-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-ac-' } } });
  await db.category.deleteMany({ where: { slug: { startsWith: 'test-ac-' } } });
  await db.user.deleteMany({ where: { username: 'test_ac_seller' } });

  const seller = await db.user.create({
    data: {
      username: 'test_ac_seller',
      email: 'test_ac_seller@test.com',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.SELLER,
      customerRole: CustomerRole.MEMBER,
      phoneVerified: true,
      emailVerified: true,
    },
  });

  const parent = await db.category.create({
    data: { name: 'Test AC Dama', slug: 'test-ac-dama', sortOrder: 1 },
  });

  const ropa = await db.category.create({
    data: { name: 'Test AC Ropa', slug: 'test-ac-ropa', parentId: parent.id, sortOrder: 1 },
  });

  const accesorios = await db.category.create({
    data: { name: 'Test AC Accesorios', slug: 'test-ac-accesorios', parentId: parent.id, sortOrder: 2 },
  });

  const products = [
    { slug: 'test-ac-vestido-rojo', title: 'Vestido Rojo Fiesta', categoryId: ropa.id, tags: ['vestido', 'rojo', 'elegante'] },
    { slug: 'test-ac-vestido-rosa', title: 'Vestido Rosa Casual', categoryId: ropa.id, tags: ['vestido', 'rosa', 'casual'] },
    { slug: 'test-ac-blusa-azul', title: 'Blusa Azul Cielo', categoryId: ropa.id, tags: ['blusa', 'azul'] },
    { slug: 'test-ac-bolso-cafe', title: 'Bolso Café Cuero', categoryId: accesorios.id, tags: ['bolso', 'cuero', 'elegante'] },
    { slug: 'test-ac-collar-plata', title: 'Collar Plata Elegante', categoryId: accesorios.id, tags: ['collar', 'plata', 'elegante'] },
  ];

  let sku = 1;
  for (const p of products) {
    const ap = await db.abstractProduct.create({
      data: {
        title: p.title, slug: p.slug, description: `Desc ${p.title}`,
        categoryId: p.categoryId, tags: p.tags,
        status: ProductStatus.PUBLISHED, isFeatured: false,
        publishedAt: new Date(), createdBy: seller.id,
      },
    });

    const variant = await db.product.create({
      data: {
        abstractProductId: ap.id, title: p.title,
        sku: `TEST-AC-${String(sku++).padStart(3, '0')}`,
        priceInCents: 30000, details: {},
        images: [{ imageUrl: 'https://placeholder.com/ac.jpg', thumbnailUrl: 'https://placeholder.com/ac.jpg' }],
        status: ProductStatus.PUBLISHED, createdBy: seller.id,
      },
    });

    await db.inventory.create({ data: { productId: variant.id, physicalStock: 5, reservedStock: 0 } });
  }
});

afterAll(async () => {
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-ac-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-ac-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-ac-' } } });
  await db.category.deleteMany({ where: { slug: { startsWith: 'test-ac-' } } });
  await db.user.deleteMany({ where: { username: 'test_ac_seller' } });
  await app.close();
  await redisClient.quit();
});

// ─── BÚSQUEDA BÁSICA ──────────────────────────────────────────

describe('Autocomplete: búsqueda básica', () => {
  it('busca por título — "Vestido" devuelve vestidos', async () => {
    const res = await autocomplete('q=Vestido');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(2);
    body.data.items.forEach((item: any) => {
      expect(item.title.toLowerCase()).toContain('vestido');
    });
  });

  it('busca parcial — "bol" encuentra "Bolso Café Cuero"', async () => {
    const res = await autocomplete('q=bol');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.some((i: any) => i.slug === 'test-ac-bolso-cafe')).toBe(true);
  });

  it('case insensitive — "BLUSA" encuentra "Blusa Azul Cielo"', async () => {
    const res = await autocomplete('q=BLUSA');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.some((i: any) => i.slug === 'test-ac-blusa-azul')).toBe(true);
  });

  it('busca por nombre de categoría — "Accesorios"', async () => {
    const res = await autocomplete('q=Accesorios');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(1);
  });

  it('busca por tag — "elegante" encuentra productos con ese tag', async () => {
    const res = await autocomplete('q=elegante');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── RESULTADOS Y LÍMITES ──────────────────────────────────────

describe('Autocomplete: resultados y límites', () => {
  it('limit funciona', async () => {
    const res = await autocomplete('q=Vestido&limit=1');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(1);
  });

  it('sin resultados para término inexistente', async () => {
    const res = await autocomplete('q=xyznoexiste999');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(0);
  });

  it('término vacío devuelve error de validación', async () => {
    const res = await autocomplete('q=');

    expect(res.statusCode).toBe(400);
  });
});

// ─── ESTRUCTURA DE RESPUESTA ───────────────────────────────────

describe('Autocomplete: estructura de respuesta', () => {
  it('cada item tiene id, title, slug, image', async () => {
    const res = await autocomplete('q=Vestido');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(1);

    const item = body.data.items[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('title');
    expect(item).toHaveProperty('slug');
    expect(item).toHaveProperty('image');
    expect(typeof item.id).toBe('string');
    expect(typeof item.title).toBe('string');
    expect(typeof item.slug).toBe('string');
  });
});
