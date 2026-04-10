import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../server';
import { db, ProductStatus } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

// IDs que se llenan en beforeAll
let parentCategoryId: string;
let ropaCategoryId: string;
let accesoriosCategoryId: string;
let sellerId: string;

const BASE_URL = '/api/products';

// Helper para hacer queries al search engine
function search(query: string) {
  return app.inject({ method: 'GET', url: `${BASE_URL}?${query}` });
}

beforeAll(async () => {
  await app.ready();

  // ─── Limpiar datos previos ───────────────────────────────────
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-se-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-se-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-se-' } } });
  await db.category.deleteMany({ where: { slug: { startsWith: 'test-se-' } } });
  await db.user.deleteMany({ where: { username: 'test_se_seller' } });

  // ─── Seller para createdBy ───────────────────────────────────
  const seller = await db.user.create({
    data: {
      username: 'test_se_seller',
      email: 'test_se_seller@test.com',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.SELLER,
      customerRole: CustomerRole.MEMBER,
      phoneVerified: true,
      emailVerified: true,
    },
  });
  sellerId = seller.id;

  // ─── Categorías ──────────────────────────────────────────────
  const parent = await db.category.create({
    data: { name: 'Test Dama', slug: 'test-se-dama', sortOrder: 1 },
  });
  parentCategoryId = parent.id;

  const ropa = await db.category.create({
    data: { name: 'Test Ropa', slug: 'test-se-ropa', parentId: parent.id, sortOrder: 1 },
  });
  ropaCategoryId = ropa.id;

  const accesorios = await db.category.create({
    data: { name: 'Test Accesorios', slug: 'test-se-accesorios', parentId: parent.id, sortOrder: 2 },
  });
  accesoriosCategoryId = accesorios.id;

  // ─── Productos de test ───────────────────────────────────────
  // Diseñados para cubrir todas las combinaciones de filtros
  const products = [
    {
      slug: 'test-se-vestido-rojo',
      title: 'Vestido Rojo Elegante',
      categoryId: ropaCategoryId,
      tags: ['vestido', 'rojo', 'elegante', 'mujer'],
      isFeatured: true,
      priceInCents: 45000,
      stock: 10,
    },
    {
      slug: 'test-se-vestido-rosa',
      title: 'Vestido Rosa Pastel',
      categoryId: ropaCategoryId,
      tags: ['vestido', 'rosa', 'casual', 'mujer'],
      isFeatured: true,
      priceInCents: 35000,
      stock: 5,
    },
    {
      slug: 'test-se-blusa-azul',
      title: 'Blusa Azul Cielo',
      categoryId: ropaCategoryId,
      tags: ['blusa', 'azul', 'casual', 'mujer'],
      isFeatured: false,
      priceInCents: 22000,
      stock: 20,
    },
    {
      slug: 'test-se-conjunto-negro',
      title: 'Conjunto Negro Fiesta',
      categoryId: ropaCategoryId,
      tags: ['conjunto', 'negro', 'fiesta', 'mujer'],
      isFeatured: false,
      priceInCents: 68000,
      stock: 3,
    },
    {
      slug: 'test-se-bolso-cafe',
      title: 'Bolso Café Cuero',
      categoryId: accesoriosCategoryId,
      tags: ['bolso', 'cafe', 'cuero', 'mujer'],
      isFeatured: true,
      priceInCents: 55000,
      stock: 8,
    },
    {
      slug: 'test-se-collar-plata',
      title: 'Collar Plata Elegante',
      categoryId: accesoriosCategoryId,
      tags: ['collar', 'plata', 'elegante', 'mujer'],
      isFeatured: false,
      priceInCents: 18000,
      stock: 15,
    },
    {
      slug: 'test-se-agotado',
      title: 'Vestido Agotado Total',
      categoryId: ropaCategoryId,
      tags: ['vestido', 'agotado'],
      isFeatured: false,
      priceInCents: 40000,
      stock: 0, // sin stock
    },
  ];

  let skuCounter = 1;
  for (const p of products) {
    const ap = await db.abstractProduct.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: `Descripción de ${p.title}`,
        categoryId: p.categoryId,
        tags: p.tags,
        status: ProductStatus.PUBLISHED,
        isFeatured: p.isFeatured,
        publishedAt: new Date(),
        createdBy: sellerId,
      },
    });

    const variant = await db.product.create({
      data: {
        abstractProductId: ap.id,
        title: p.title,
        sku: `TEST-SE-${String(skuCounter++).padStart(3, '0')}`,
        priceInCents: p.priceInCents,
        details: { color: p.tags[1] || 'n/a' },
        images: [{ imageUrl: 'https://placeholder.com/img.jpg', thumbnailUrl: 'https://placeholder.com/img.jpg' }],
        status: ProductStatus.PUBLISHED,
        createdBy: sellerId,
      },
    });

    await db.inventory.create({
      data: { productId: variant.id, physicalStock: p.stock, reservedStock: 0 },
    });
  }
});

afterAll(async () => {
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-se-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-se-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-se-' } } });
  await db.category.deleteMany({ where: { slug: { startsWith: 'test-se-' } } });
  await db.user.deleteMany({ where: { username: 'test_se_seller' } });
  await app.close();
  await redisClient.quit();
});

// ─── SIN FILTROS ───────────────────────────────────────────────

describe('Search engine: sin filtros', () => {
  it('devuelve productos con paginación por defecto', async () => {
    const res = await search('limit=100&includeLikes=true');

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.total).toBeGreaterThanOrEqual(7);
    expect(body.data.items.length).toBeGreaterThanOrEqual(7);

    // Cada item tiene la estructura esperada
    const item = body.data.items[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('title');
    expect(item).toHaveProperty('slug');
    expect(item).toHaveProperty('variantes');
    expect(item).toHaveProperty('categorias');
    expect(item).toHaveProperty('inStock');
    expect(Array.isArray(item.variantes)).toBe(true);
    expect(Array.isArray(item.categorias)).toBe(true);
  });

  it('limit y offset funcionan', async () => {
    const page1 = await search('limit=3&offset=0&includeLikes=true');
    const page2 = await search('limit=3&offset=3&includeLikes=true');

    const items1 = page1.json().data.items;
    const items2 = page2.json().data.items;

    expect(items1.length).toBe(3);
    expect(items2.length).toBeGreaterThanOrEqual(1);

    // No deben repetirse
    const ids1 = items1.map((i: any) => i.id);
    const ids2 = items2.map((i: any) => i.id);
    const overlap = ids1.filter((id: string) => ids2.includes(id));
    expect(overlap.length).toBe(0);
  });
});

// ─── FILTRO POR CATEGORÍA ──────────────────────────────────────

describe('Search engine: filtro por categoría', () => {
  it('filtra por subcategoría directa', async () => {
    const res = await search(`categoryIds=${ropaCategoryId}&includeLikes=true`);
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(4);
    body.data.items.forEach((item: any) => {
      expect(item.categoryId).toBe(ropaCategoryId);
    });
  });

  it('filtra por categoría padre (incluye hijas recursivamente)', async () => {
    const res = await search(`categoryIds=${parentCategoryId}&includeLikes=true`);
    const body = res.json();

    expect(res.statusCode).toBe(200);
    // Debe incluir productos de ropa Y accesorios
    const categoryIds = new Set(body.data.items.map((i: any) => i.categoryId));
    expect(categoryIds.has(ropaCategoryId)).toBe(true);
    expect(categoryIds.has(accesoriosCategoryId)).toBe(true);
  });

  it('filtra por múltiples categorías', async () => {
    const res = await search(`categoryIds=${ropaCategoryId},${accesoriosCategoryId}&includeLikes=true`);
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(6);
  });
});

// ─── FILTRO POR TÍTULO ─────────────────────────────────────────

describe('Search engine: filtro por título', () => {
  it('busca por substring (case insensitive)', async () => {
    const res = await search('title=vestido&includeLikes=true');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(2);
    body.data.items.forEach((item: any) => {
      expect(item.title.toLowerCase()).toContain('vestido');
    });
  });

  it('busca parcial — "azul" encuentra "Blusa Azul Cielo"', async () => {
    const res = await search('title=azul&includeLikes=true');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.some((i: any) => i.slug === 'test-se-blusa-azul')).toBe(true);
  });

  it('sin resultados para título inexistente', async () => {
    const res = await search('title=xyznoexiste123&includeLikes=true');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(0);
    expect(body.data.total).toBe(0);
  });
});

// ─── FILTRO POR TAGS ───────────────────────────────────────────

describe('Search engine: filtro por tags', () => {
  it('un tag — todos los productos con "vestido"', async () => {
    const res = await search('tags=vestido&includeLikes=true');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(3);
    body.data.items.forEach((item: any) => {
      expect(item.tags).toContain('vestido');
    });
  });

  it('múltiples tags — AND lógico: "vestido" + "rojo"', async () => {
    const res = await search('tags=vestido,rojo&includeLikes=true');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(1);
    body.data.items.forEach((item: any) => {
      expect(item.tags).toContain('vestido');
      expect(item.tags).toContain('rojo');
    });
  });

  it('tag "elegante" encuentra ropa y accesorios', async () => {
    const res = await search('tags=elegante&includeLikes=true');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    const slugs = body.data.items.map((i: any) => i.slug);
    expect(slugs).toContain('test-se-vestido-rojo');
    expect(slugs).toContain('test-se-collar-plata');
  });
});

// ─── FILTRO POR isFeatured ─────────────────────────────────────

describe('Search engine: filtro por isFeatured', () => {
  it('solo featured', async () => {
    const res = await search('isFeatured=true&includeLikes=true&limit=100');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    body.data.items.forEach((item: any) => {
      expect(item.isFeatured).toBe(true);
    });
    // Nuestros 3 featured de test
    const slugs = body.data.items.map((i: any) => i.slug);
    expect(slugs).toContain('test-se-vestido-rojo');
    expect(slugs).toContain('test-se-vestido-rosa');
    expect(slugs).toContain('test-se-bolso-cafe');
  });

  it('solo no featured', async () => {
    const res = await search('isFeatured=false&includeLikes=true&limit=100');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    body.data.items.forEach((item: any) => {
      expect(item.isFeatured).toBe(false);
    });
  });
});

// ─── FILTRO POR RANGO DE PRECIO ────────────────────────────────

describe('Search engine: filtro por precio', () => {
  it('precio mínimo: >= $300', async () => {
    const res = await search('minPriceInCents=30000&includeLikes=true&limit=100');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    body.data.items.forEach((item: any) => {
      const minPrice = Math.min(...item.variantes.map((v: any) => v.priceInCents));
      expect(minPrice).toBeGreaterThanOrEqual(30000);
    });
  });

  it('precio máximo: <= $250', async () => {
    const res = await search('maxPriceInCents=25000&includeLikes=true');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBeGreaterThanOrEqual(1);
    // Blusa azul ($220) y collar plata ($180) deben estar
    const slugs = body.data.items.map((i: any) => i.slug);
    expect(slugs).toContain('test-se-blusa-azul');
    expect(slugs).toContain('test-se-collar-plata');
  });

  it('rango de precio: $200 - $400', async () => {
    const res = await search('minPriceInCents=20000&maxPriceInCents=40000&includeLikes=true');
    const body = res.json();

    expect(res.statusCode).toBe(200);
    const slugs = body.data.items.map((i: any) => i.slug);
    expect(slugs).toContain('test-se-blusa-azul');     // $220
    expect(slugs).toContain('test-se-vestido-rosa');   // $350
    expect(slugs).not.toContain('test-se-conjunto-negro'); // $680 - fuera de rango
  });
});

// ─── ORDENAMIENTO ──────────────────────────────────────────────

describe('Search engine: ordenamiento', () => {
  it('ordena por precio ascendente', async () => {
    const res = await search(
      `categoryIds=${ropaCategoryId}&sort=${encodeURIComponent('[{"field":"price","direction":"asc"}]')}&includeLikes=true`
    );
    const body = res.json();

    expect(res.statusCode).toBe(200);
    const prices = body.data.items.map((i: any) => i.variantes[0]?.priceInCents).filter(Boolean);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  it('ordena por precio descendente', async () => {
    const res = await search(
      `categoryIds=${ropaCategoryId}&sort=${encodeURIComponent('[{"field":"price","direction":"desc"}]')}&includeLikes=true`
    );
    const body = res.json();

    expect(res.statusCode).toBe(200);
    const prices = body.data.items.map((i: any) => i.variantes[0]?.priceInCents).filter(Boolean);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  it('ordena por título alfabéticamente', async () => {
    const res = await search(
      `categoryIds=${parentCategoryId}&sort=${encodeURIComponent('[{"field":"title","direction":"asc"}]')}&includeLikes=true`
    );
    const body = res.json();

    expect(res.statusCode).toBe(200);
    const titles = body.data.items.map((i: any) => i.title.toLowerCase());
    for (let i = 1; i < titles.length; i++) {
      expect(titles[i] >= titles[i - 1]).toBe(true);
    }
  });

  it('random con seed devuelve resultados reproducibles', async () => {
    const query = `sort=${encodeURIComponent('[{"field":"random","direction":"asc"}]')}&randomSeed=0.42&limit=5&includeLikes=true`;

    const res1 = await search(query);
    const res2 = await search(query);

    const ids1 = res1.json().data.items.map((i: any) => i.id);
    const ids2 = res2.json().data.items.map((i: any) => i.id);

    expect(ids1).toEqual(ids2);
  });
});

// ─── COMBINACIONES DE FILTROS ──────────────────────────────────

describe('Search engine: combinaciones', () => {
  it('categoría + featured', async () => {
    const res = await search(`categoryIds=${ropaCategoryId}&isFeatured=true&includeLikes=true`);
    const body = res.json();

    expect(res.statusCode).toBe(200);
    body.data.items.forEach((item: any) => {
      expect(item.categoryId).toBe(ropaCategoryId);
      expect(item.isFeatured).toBe(true);
    });
    // Vestido rojo y vestido rosa
    expect(body.data.items.length).toBe(2);
  });

  it('categoría + tags + precio', async () => {
    const res = await search(
      `categoryIds=${ropaCategoryId}&tags=vestido&maxPriceInCents=40000&includeLikes=true`
    );
    const body = res.json();

    expect(res.statusCode).toBe(200);
    const slugs = body.data.items.map((i: any) => i.slug);
    // Vestido rosa ($350) y vestido agotado ($400) caben en rango
    expect(slugs).toContain('test-se-vestido-rosa');
    expect(slugs).toContain('test-se-agotado');
    // Vestido rojo ($450) no cabe
    expect(slugs).not.toContain('test-se-vestido-rojo');
  });

  it('título + categoría padre', async () => {
    const res = await search(`categoryIds=${parentCategoryId}&title=collar&includeLikes=true`);
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(1);
    expect(body.data.items[0].slug).toBe('test-se-collar-plata');
  });

  it('featured + precio + sort por precio', async () => {
    const res = await search(
      `isFeatured=true&minPriceInCents=30000&sort=${encodeURIComponent('[{"field":"price","direction":"asc"}]')}&includeLikes=true`
    );
    const body = res.json();

    expect(res.statusCode).toBe(200);
    body.data.items.forEach((item: any) => {
      expect(item.isFeatured).toBe(true);
    });
    // Ordenados por precio
    const prices = body.data.items.map((i: any) => i.variantes[0]?.priceInCents).filter(Boolean);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });
});

// ─── ESTRUCTURA DE RESPUESTA ───────────────────────────────────

describe('Search engine: estructura de datos', () => {
  it('variantes tienen la estructura correcta', async () => {
    const res = await search(`title=Vestido%20Rojo%20Elegante&includeLikes=true`);
    const body = res.json();
    const item = body.data.items.find((i: any) => i.slug === 'test-se-vestido-rojo');

    expect(item).toBeDefined();
    expect(item.variantes.length).toBe(1);

    const variante = item.variantes[0];
    expect(variante).toHaveProperty('id');
    expect(variante).toHaveProperty('sku');
    expect(variante).toHaveProperty('title');
    expect(variante).toHaveProperty('priceInCents');
    expect(variante).toHaveProperty('images');
    expect(variante).toHaveProperty('details');
    expect(variante).toHaveProperty('inStock');
    expect(variante.priceInCents).toBe(45000);
    expect(variante.inStock).toBe(true);
  });

  it('breadcrumb de categorías es correcto (padre → hijo)', async () => {
    const res = await search(`title=Bolso%20Caf&includeLikes=true`);
    const body = res.json();
    const item = body.data.items.find((i: any) => i.slug === 'test-se-bolso-cafe');

    expect(item).toBeDefined();
    expect(item.categorias.length).toBe(2);
    expect(item.categorias[0].slug).toBe('test-se-dama');       // padre primero
    expect(item.categorias[1].slug).toBe('test-se-accesorios'); // hijo después
  });

  it('inStock es false cuando no hay stock', async () => {
    const res = await search('title=Agotado&includeLikes=true');
    const body = res.json();
    const item = body.data.items.find((i: any) => i.slug === 'test-se-agotado');

    expect(item).toBeDefined();
    expect(item.inStock).toBe(false);
    expect(item.variantes[0].inStock).toBe(false);
  });

  it('total refleja el conteo real sin paginación', async () => {
    const res = await search(`categoryIds=${ropaCategoryId}&limit=2&includeLikes=true`);
    const body = res.json();

    expect(body.data.items.length).toBe(2); // solo 2 por limit
    expect(body.data.total).toBeGreaterThanOrEqual(4); // pero el total real es mayor
  });
});
