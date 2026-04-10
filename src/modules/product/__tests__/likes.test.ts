import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../server';
import { db, ProductStatus } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

let accessToken: string;
let abstractProductId: string;

beforeAll(async () => {
  await app.ready();

  // Limpiar
  await db.productLike.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-like-' } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-like-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-like-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-like-' } } });
  await db.category.deleteMany({ where: { slug: 'test-like-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_like_' } } });

  // Usuario autenticado
  const user = await db.user.create({
    data: {
      username: 'test_like_user',
      email: 'test_like@test.com',
      phone: '+15559880001',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER,
      customerRole: CustomerRole.MEMBER,
      phoneVerified: true,
      emailVerified: true,
    },
  });

  const loginRes = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { identifier: user.username, password: 'Test12345' },
  });
  accessToken = loginRes.json().data.accessToken;

  // Seller para createdBy
  const seller = await db.user.create({
    data: {
      username: 'test_like_seller',
      email: 'test_like_seller@test.com',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.SELLER,
      customerRole: CustomerRole.MEMBER,
      phoneVerified: true,
      emailVerified: true,
    },
  });

  // Categoría y producto
  const cat = await db.category.create({
    data: { name: 'Test Like Cat', slug: 'test-like-cat', sortOrder: 99 },
  });

  const ap = await db.abstractProduct.create({
    data: {
      title: 'Producto Para Likear',
      slug: 'test-like-producto',
      description: 'Un producto para probar likes',
      categoryId: cat.id,
      tags: ['test', 'like'],
      status: ProductStatus.PUBLISHED,
      isFeatured: false,
      publishedAt: new Date(),
      createdBy: seller.id,
    },
  });
  abstractProductId = ap.id;

  const variant = await db.product.create({
    data: {
      abstractProductId: ap.id,
      title: 'Producto Para Likear',
      sku: 'TEST-LIKE-001',
      priceInCents: 30000,
      details: {},
      images: [{ imageUrl: 'https://placeholder.com/like.jpg', thumbnailUrl: 'https://placeholder.com/like.jpg' }],
      status: ProductStatus.PUBLISHED,
      createdBy: seller.id,
    },
  });

  await db.inventory.create({
    data: { productId: variant.id, physicalStock: 5, reservedStock: 0 },
  });
});

afterAll(async () => {
  await db.productLike.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-like-' } } } });
  await db.inventory.deleteMany({ where: { product: { abstractProduct: { slug: { startsWith: 'test-like-' } } } } });
  await db.product.deleteMany({ where: { abstractProduct: { slug: { startsWith: 'test-like-' } } } });
  await db.abstractProduct.deleteMany({ where: { slug: { startsWith: 'test-like-' } } });
  await db.category.deleteMany({ where: { slug: 'test-like-cat' } });
  await db.user.deleteMany({ where: { username: { startsWith: 'test_like_' } } });
  await app.close();
  await redisClient.quit();
});

describe('Likes: flujo completo', () => {
  it('dar like a un producto', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/products/${abstractProductId}/like`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.abstractProductId).toBe(abstractProductId);
  });

  it('liked IDs incluye el producto', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/products/liked/ids',
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data).toContain(abstractProductId);
  });

  it('liked products incluye el producto con datos completos', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/products/liked',
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.items.length).toBeGreaterThanOrEqual(1);

    const liked = body.data.items.find((i: any) => i.product.id === abstractProductId);
    expect(liked).toBeDefined();
    expect(liked.product.title).toBe('Producto Para Likear');
    expect(liked.likedAt).toBeDefined();
  });

  it('quitar like', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/products/${abstractProductId}/like`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.removed).toBe(true);
  });

  it('después de quitar, ya no aparece en liked IDs', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/products/liked/ids',
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data).not.toContain(abstractProductId);
  });

  it('like a producto inexistente devuelve 404', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/products/00000000-0000-0000-0000-000000000000/like',
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(404);
  });
});
