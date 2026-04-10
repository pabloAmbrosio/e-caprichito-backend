import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../server';
import { db } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';

const app = buildServer();

let parentId: string;
let childId1: string;
let childId2: string;

beforeAll(async () => {
  await app.ready();

  // Limpiar
  await db.category.deleteMany({ where: { slug: { startsWith: 'test-cat-' } } });

  // Crear árbol: padre con 2 hijos
  const parent = await db.category.create({
    data: {
      name: 'Test Cat Padre',
      slug: 'test-cat-padre',
      description: 'Categoría padre de test',
      image: 'https://placeholder.com/parent.jpg',
      emoticon: '🧪',
      sortOrder: 99,
    },
  });
  parentId = parent.id;

  const child1 = await db.category.create({
    data: {
      name: 'Test Cat Hija Uno',
      slug: 'test-cat-hija-uno',
      description: 'Primera subcategoría',
      image: 'https://placeholder.com/child1.jpg',
      emoticon: '🔵',
      parentId: parent.id,
      sortOrder: 1,
    },
  });
  childId1 = child1.id;

  const child2 = await db.category.create({
    data: {
      name: 'Test Cat Hija Dos',
      slug: 'test-cat-hija-dos',
      description: 'Segunda subcategoría',
      image: 'https://placeholder.com/child2.jpg',
      emoticon: '🔴',
      parentId: parent.id,
      sortOrder: 2,
    },
  });
  childId2 = child2.id;
});

afterAll(async () => {
  await db.category.deleteMany({ where: { slug: { startsWith: 'test-cat-' } } });
  await app.close();
  await redisClient.quit();
});

describe('GET /api/categories', () => {
  it('devuelve tree y flat con datos', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/categories' });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toHaveProperty('tree');
    expect(body.data).toHaveProperty('flat');
    expect(body.data.tree.length).toBeGreaterThanOrEqual(1);
    expect(body.data.flat.length).toBeGreaterThanOrEqual(3);
  });

  it('tree tiene estructura padre → hijos anidados', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/categories' });
    const body = res.json();

    const parent = body.data.tree.find((c: any) => c.id === parentId);
    expect(parent).toBeDefined();
    expect(parent.children).toBeDefined();
    expect(parent.children.length).toBe(2);

    const childSlugs = parent.children.map((c: any) => c.slug);
    expect(childSlugs).toContain('test-cat-hija-uno');
    expect(childSlugs).toContain('test-cat-hija-dos');
  });

  it('flat tiene todos los IDs sin anidar', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/categories' });
    const body = res.json();

    const flatIds = body.data.flat.map((c: any) => c.id);
    expect(flatIds).toContain(parentId);
    expect(flatIds).toContain(childId1);
    expect(flatIds).toContain(childId2);

    // flat no tiene children
    const parent = body.data.flat.find((c: any) => c.id === parentId);
    expect(parent.children).toBeUndefined();
  });

  it('cada categoría tiene los campos que necesita el front', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/categories' });
    const body = res.json();

    const parent = body.data.flat.find((c: any) => c.id === parentId);
    expect(parent).toHaveProperty('id');
    expect(parent).toHaveProperty('name');
    expect(parent).toHaveProperty('slug');
    expect(parent).toHaveProperty('image');
    expect(parent).toHaveProperty('emoticon');
    expect(parent).toHaveProperty('parentId');
    expect(parent).toHaveProperty('isActive');
    expect(parent).toHaveProperty('sortOrder');

    expect(parent.name).toBe('Test Cat Padre');
    expect(parent.slug).toBe('test-cat-padre');
    expect(parent.emoticon).toBe('🧪');
    expect(parent.parentId).toBeNull();
  });

  it('IDs de flat coinciden con los del tree', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/categories' });
    const body = res.json();

    // Extraer todos los IDs del tree recursivamente
    function extractTreeIds(nodes: any[]): string[] {
      return nodes.flatMap((n: any) => [n.id, ...extractTreeIds(n.children || [])]);
    }

    const treeIds = new Set(extractTreeIds(body.data.tree));
    const flatIds = new Set(body.data.flat.map((c: any) => c.id));

    // Todos los del flat deben estar en el tree
    for (const id of flatIds) {
      expect(treeIds.has(id)).toBe(true);
    }
  });

  it('subcategorías tienen parentId apuntando al padre correcto', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/categories' });
    const body = res.json();

    const child1 = body.data.flat.find((c: any) => c.id === childId1);
    const child2 = body.data.flat.find((c: any) => c.id === childId2);

    expect(child1.parentId).toBe(parentId);
    expect(child2.parentId).toBe(parentId);
  });

  it('filtro type=parents solo devuelve raíces', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/categories?type=parents' });
    const body = res.json();

    expect(res.statusCode).toBe(200);
    // En flat, ninguno debería tener parentId
    body.data.flat.forEach((c: any) => {
      expect(c.parentId).toBeNull();
    });

    // Nuestro padre debe estar
    const flatIds = body.data.flat.map((c: any) => c.id);
    expect(flatIds).toContain(parentId);
    // Nuestros hijos NO deben estar
    expect(flatIds).not.toContain(childId1);
    expect(flatIds).not.toContain(childId2);
  });
});
