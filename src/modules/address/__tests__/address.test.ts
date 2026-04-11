import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '../../server';
import { db } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';
import { hashPassword } from '../../../lib/bcrypt';
import { AdminRole, CustomerRole } from '../../../lib/roles';

const app = buildServer();

let token: string;
let userId: string;
let token2: string;
let userId2: string;

const PREFIX = 'test_addr_';
const ADDR_URL = '/api/addresses';

function auth(t: string) {
  return { authorization: `Bearer ${t}` };
}

async function cleanupAddresses() {
  await db.address.deleteMany({ where: { user: { username: { startsWith: PREFIX } } } });
}

const baseAddress = {
  label: 'Casa',
  formattedAddress: 'Calle Test 123, Colonia Centro',
  lat: 18.97,
  lng: -91.18,
};

beforeAll(async () => {
  await app.ready();

  await cleanupAddresses();
  await db.user.deleteMany({ where: { username: { startsWith: PREFIX } } });

  // Usuario 1
  const u1 = await db.user.create({
    data: {
      username: `${PREFIX}u1`, email: `${PREFIX}u1@test.com`, phone: '+15559990001',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  userId = u1.id;
  const login1 = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: `${PREFIX}u1`, password: 'Test12345' },
  });
  token = login1.json().data.accessToken;

  // Usuario 2
  const u2 = await db.user.create({
    data: {
      username: `${PREFIX}u2`, email: `${PREFIX}u2@test.com`, phone: '+15559990002',
      passwordHash: await hashPassword('Test12345'),
      adminRole: AdminRole.CUSTOMER, customerRole: CustomerRole.MEMBER,
      phoneVerified: true, emailVerified: true,
    },
  });
  userId2 = u2.id;
  const login2 = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: `${PREFIX}u2`, password: 'Test12345' },
  });
  token2 = login2.json().data.accessToken;
});

afterAll(async () => {
  await cleanupAddresses();
  await db.user.deleteMany({ where: { username: { startsWith: PREFIX } } });
  await app.close();
  await redisClient.quit();
});

// ─── CRUD BÁSICO ───────────────────────────────────────────────

describe('CRUD de direcciones', () => {
  beforeEach(() => cleanupAddresses());

  it('crear primera dirección: auto-default', async () => {
    const res = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Primera' },
    });

    expect(res.statusCode).toBe(201);
    const data = res.json().data;
    expect(data.label).toBe('Primera');
    expect(data.isDefault).toBe(true); // primera = auto default
  });

  it('crear segunda dirección: no es default por defecto', async () => {
    await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Primera' },
    });

    const res = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Segunda', lat: 19.0, lng: -91.0 },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().data.isDefault).toBe(false);
  });

  it('listar mis direcciones', async () => {
    await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Dir 1' },
    });
    await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Dir 2', lat: 19.1, lng: -91.1 },
    });

    const res = await app.inject({
      method: 'GET', url: ADDR_URL, headers: auth(token),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.length).toBe(2);
  });

  it('actualizar dirección', async () => {
    const createRes = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Original' },
    });
    const id = createRes.json().data.id;

    const res = await app.inject({
      method: 'PATCH', url: `${ADDR_URL}/${id}`, headers: auth(token),
      payload: { label: 'Actualizada', details: 'Piso 3' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.label).toBe('Actualizada');
    expect(res.json().data.details).toBe('Piso 3');
  });

  it('eliminar dirección (soft delete)', async () => {
    const createRes = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Para borrar' },
    });
    const id = createRes.json().data.id;

    // Necesitamos otra dirección para que no sea la única default
    await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Otra', lat: 19.5, lng: -91.5 },
    });

    const res = await app.inject({
      method: 'DELETE', url: `${ADDR_URL}/${id}`, headers: auth(token),
    });
    expect(res.statusCode).toBe(200);

    // Ya no aparece en listado
    const listRes = await app.inject({
      method: 'GET', url: ADDR_URL, headers: auth(token),
    });
    const found = listRes.json().data.find((a: any) => a.id === id);
    expect(found).toBeUndefined();
  });
});

// ─── DEFAULT ADDRESS LOGIC ─────────────────────────────────────

describe('Lógica de dirección default', () => {
  beforeEach(() => cleanupAddresses());

  it('crear con isDefault=true: las demás pierden default', async () => {
    const first = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Primera' },
    });
    expect(first.json().data.isDefault).toBe(true);

    const second = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Nueva Default', isDefault: true, lat: 19.1, lng: -91.1 },
    });
    expect(second.json().data.isDefault).toBe(true);

    // La primera ya no es default
    const listRes = await app.inject({
      method: 'GET', url: ADDR_URL, headers: auth(token),
    });
    const primera = listRes.json().data.find((a: any) => a.label === 'Primera');
    expect(primera.isDefault).toBe(false);
  });

  it('borrar default: la siguiente más reciente se vuelve default', async () => {
    const first = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Vieja' },
    });

    const second = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Nueva', isDefault: true, lat: 19.2, lng: -91.2 },
    });
    const defaultId = second.json().data.id;

    // Borrar la default
    await app.inject({
      method: 'DELETE', url: `${ADDR_URL}/${defaultId}`, headers: auth(token),
    });

    // La vieja ahora es default
    const listRes = await app.inject({
      method: 'GET', url: ADDR_URL, headers: auth(token),
    });
    expect(listRes.json().data.length).toBe(1);
    expect(listRes.json().data[0].isDefault).toBe(true);
  });
});

// ─── LÍMITE DE 10 DIRECCIONES ──────────────────────────────────

describe('Límite de 10 direcciones', () => {
  beforeEach(() => cleanupAddresses());

  it('la dirección 11 es rechazada', async () => {
    // Crear 10
    for (let i = 0; i < 10; i++) {
      const res = await app.inject({
        method: 'POST', url: ADDR_URL, headers: auth(token),
        payload: { ...baseAddress, label: `Dir ${i}`, lat: 18.9 + i * 0.01, lng: -91.1 + i * 0.01 },
      });
      expect(res.statusCode).toBe(201);
    }

    // La 11 falla
    const res = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Número 11', lat: 20.0, lng: -90.0 },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('ADDRESS_LIMIT_EXCEEDED');
  });
});

// ─── OWNERSHIP Y SEGURIDAD ────────────────────────────────────

describe('Ownership y seguridad', () => {
  beforeEach(() => cleanupAddresses());

  it('no puede editar dirección de otro usuario', async () => {
    // Crear dirección del usuario 1
    const createRes = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Del usuario 1' },
    });
    const id = createRes.json().data.id;

    // Usuario 2 intenta editar
    const res = await app.inject({
      method: 'PATCH', url: `${ADDR_URL}/${id}`, headers: auth(token2),
      payload: { label: 'Hackeada' },
    });

    expect(res.statusCode).toBe(403);
  });

  it('no puede borrar dirección de otro usuario', async () => {
    const createRes = await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'No borrar' },
    });
    const id = createRes.json().data.id;

    const res = await app.inject({
      method: 'DELETE', url: `${ADDR_URL}/${id}`, headers: auth(token2),
    });

    expect(res.statusCode).toBe(403);
  });

  it('no puede ver direcciones de otro usuario (listado)', async () => {
    await app.inject({
      method: 'POST', url: ADDR_URL, headers: auth(token),
      payload: { ...baseAddress, label: 'Secreta' },
    });

    // Usuario 2 lista sus direcciones — no ve las del usuario 1
    const res = await app.inject({
      method: 'GET', url: ADDR_URL, headers: auth(token2),
    });

    expect(res.statusCode).toBe(200);
    const labels = res.json().data.map((a: any) => a.label);
    expect(labels).not.toContain('Secreta');
  });

  it('sin auth devuelve 401', async () => {
    const res = await app.inject({
      method: 'GET', url: ADDR_URL,
    });
    expect(res.statusCode).toBe(401);
  });

  it('dirección inexistente devuelve 404', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `${ADDR_URL}/00000000-0000-0000-0000-000000000000`,
      headers: auth(token),
      payload: { label: 'Fantasma' },
    });
    expect(res.statusCode).toBe(404);
  });
});
