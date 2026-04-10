import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '../../server';
import { db } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

// Helper: crear usuario directo en BD y obtener JWT
async function createAdminAndLogin(role: AdminRole, suffix: string) {
  const passwordHash = await hashPassword('Admin12345');
  const user = await db.user.create({
    data: {
      username: `testadmin_${suffix}`,
      email: `testadmin_${suffix}@caprichito.com`,
      phone: `+155522200${suffix.padStart(2, '0')}`,
      passwordHash,
      adminRole: role,
      customerRole: CustomerRole.MEMBER,
      phoneVerified: true,
      emailVerified: true,
    },
  });

  const loginRes = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { identifier: user.username, password: 'Admin12345' },
  });

  return { user, token: loginRes.json().data.accessToken };
}

// Helper: limpiar usuarios de test
async function cleanup() {
  await db.user.deleteMany({
    where: {
      OR: [
        { username: { startsWith: 'testadmin_' } },
        { username: { startsWith: 'newuser_' } },
        { username: { startsWith: 'searchuser_' } },
      ],
    },
  });

  const keys = await redisClient.keys('rt:*');
  if (keys.length) await redisClient.del(...keys);
}

let ownerToken: string;
let adminToken: string;
let managerToken: string;
let customerToken: string;

beforeAll(async () => {
  await app.ready();
  await cleanup();

  const owner = await createAdminAndLogin(AdminRole.OWNER, '01');
  ownerToken = owner.token;

  const admin = await createAdminAndLogin(AdminRole.ADMIN, '02');
  adminToken = admin.token;

  const manager = await createAdminAndLogin(AdminRole.MANAGER, '03');
  managerToken = manager.token;

  const customer = await createAdminAndLogin(AdminRole.CUSTOMER, '04');
  customerToken = customer.token;
});

afterAll(async () => {
  await cleanup();
  await app.close();
  await redisClient.quit();
});

// ─── CREAR USUARIO ─────────────────────────────────────────────

describe('POST /api/backoffice/users', () => {
  afterEach(async () => {
    await db.user.deleteMany({ where: { username: { startsWith: 'newuser_' } } });
  });

  it('OWNER crea un usuario nuevo', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        username: 'newuser_seller',
        password: 'Seller1234',
        email: 'newuser_seller@caprichito.com',
        phone: '+15559990001',
        firstName: 'Nuevo',
        lastName: 'Vendedor',
        adminRole: 'SELLER',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.username).toBe('newuser_seller');
    expect(body.data.adminRole).toBe('SELLER');
  });

  it('rechaza username duplicado', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        username: 'newuser_dup',
        password: 'Seller1234',
        adminRole: 'SELLER',
      },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        username: 'newuser_dup',
        password: 'Seller1234',
        adminRole: 'SELLER',
      },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('USERNAME_TAKEN');
  });

  it('MANAGER no puede crear usuarios', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${managerToken}` },
      payload: {
        username: 'newuser_nope',
        password: 'Seller1234',
        adminRole: 'SELLER',
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('CUSTOMER no puede acceder', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${customerToken}` },
      payload: {
        username: 'newuser_nope2',
        password: 'Seller1234',
        adminRole: 'SELLER',
      },
    });

    expect(res.statusCode).toBe(403);
  });
});

// ─── LISTAR USUARIOS ───────────────────────────────────────────

describe('GET /api/backoffice/users', () => {
  it('OWNER lista usuarios con paginación', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/backoffice/users?page=1&limit=5',
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toBeDefined();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(5);
  });

  it('filtra por adminRole', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/backoffice/users?adminRole=OWNER',
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    body.data.forEach((u: any) => expect(u.adminRole).toBe('OWNER'));
  });

  it('busca por nombre/username', async () => {
    // Crear un usuario con nombre específico
    await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        username: 'searchuser_pedro',
        password: 'Search1234',
        firstName: 'Pedro',
        lastName: 'Búsqueda',
        adminRole: 'SELLER',
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/backoffice/users?search=pedro',
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data.some((u: any) => u.username === 'searchuser_pedro')).toBe(true);

    // Cleanup
    await db.user.deleteMany({ where: { username: 'searchuser_pedro' } });
  });

  it('MANAGER puede listar', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${managerToken}` },
    });

    expect(res.statusCode).toBe(200);
  });

  it('CUSTOMER no puede listar', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${customerToken}` },
    });

    expect(res.statusCode).toBe(403);
  });
});

// ─── OBTENER USUARIO POR ID ────────────────────────────────────

describe('GET /api/backoffice/users/:id', () => {
  it('devuelve datos del usuario', async () => {
    // Crear usuario de test
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        username: 'newuser_detail',
        password: 'Detail1234',
        email: 'newuser_detail@caprichito.com',
        adminRole: 'SELLER',
      },
    });
    const userId = createRes.json().data.id;

    const res = await app.inject({
      method: 'GET',
      url: `/api/backoffice/users/${userId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.username).toBe('newuser_detail');
    expect(res.json().data.email).toBe('newuser_detail@caprichito.com');

    await db.user.deleteMany({ where: { username: 'newuser_detail' } });
  });

  it('devuelve 404 para usuario inexistente', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/backoffice/users/00000000-0000-0000-0000-000000000000',
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('USER_NOT_FOUND');
  });
});

// ─── ACTUALIZAR USUARIO ────────────────────────────────────────

describe('PATCH /api/backoffice/users/:id', () => {
  it('OWNER actualiza email y nombre', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        username: 'newuser_update',
        password: 'Update1234',
        adminRole: 'SELLER',
      },
    });
    const userId = createRes.json().data.id;

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/users/${userId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        email: 'updated@caprichito.com',
        firstName: 'Actualizado',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.email).toBe('updated@caprichito.com');
    expect(res.json().data.firstName).toBe('Actualizado');

    await db.user.deleteMany({ where: { username: 'newuser_update' } });
  });

  it('OWNER cambia rol de CUSTOMER a SELLER', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        username: 'newuser_rolechange',
        password: 'Role12345',
        adminRole: 'CUSTOMER',
      },
    });
    const userId = createRes.json().data.id;

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/users/${userId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: { adminRole: 'SELLER' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.adminRole).toBe('SELLER');

    await db.user.deleteMany({ where: { username: 'newuser_rolechange' } });
  });
});

// ─── SOFT DELETE Y RESTAURAR ───────────────────────────────────

describe('DELETE y RESTORE /api/backoffice/users/:id', () => {
  it('soft delete: usuario desaparece del listado', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        username: 'newuser_delete',
        password: 'Delete1234',
        adminRole: 'SELLER',
      },
    });
    const userId = createRes.json().data.id;

    // Delete
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/backoffice/users/${userId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    expect(deleteRes.statusCode).toBe(200);

    // No aparece en listado normal
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/backoffice/users?search=newuser_delete',
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    const found = listRes.json().data.find((u: any) => u.id === userId);
    expect(found).toBeUndefined();

    // Get by ID devuelve 404
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/backoffice/users/${userId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    expect(getRes.statusCode).toBe(404);

    await db.user.deleteMany({ where: { username: 'newuser_delete' } });
  });

  it('restaurar usuario borrado lo trae de vuelta', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/backoffice/users',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        username: 'newuser_restore',
        password: 'Restore1234',
        adminRole: 'SELLER',
      },
    });
    const userId = createRes.json().data.id;

    // Delete
    await app.inject({
      method: 'DELETE',
      url: `/api/backoffice/users/${userId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    // Restore
    const restoreRes = await app.inject({
      method: 'PATCH',
      url: `/api/backoffice/users/${userId}/restore`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    expect(restoreRes.statusCode).toBe(200);

    // Vuelve a aparecer
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/backoffice/users/${userId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().data.username).toBe('newuser_restore');

    await db.user.deleteMany({ where: { username: 'newuser_restore' } });
  });
});
