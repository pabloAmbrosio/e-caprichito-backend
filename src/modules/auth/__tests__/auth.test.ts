import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '../../server';
import { db } from '../../../lib/prisma';
import { redisClient } from '../../../lib/redis';

const app = buildServer();

const TEST_USER = {
  username: 'testuser',
  phone: '+15551110001',
  password: 'TestPass123',
  email: 'test@caprichito.com',
  firstName: 'Test',
  lastName: 'User',
};

// Helper: limpiar datos de test de la BD y Redis
async function cleanup() {
  await db.user.deleteMany({
    where: {
      OR: [
        { username: { startsWith: 'testuser' } },
        { phone: { startsWith: '+15551110' } },
        { email: { startsWith: 'test' } },
      ],
    },
  });

  // Limpiar keys de OTP y tokens de test en Redis
  const keys = await redisClient.keys('otp:*+15551110*');
  const tokenKeys = await redisClient.keys('rt:*');
  const allKeys = [...keys, ...tokenKeys];
  if (allKeys.length) await redisClient.del(...allKeys);
}

beforeAll(async () => {
  await app.ready();
  await cleanup();
});

afterAll(async () => {
  await cleanup();
  await app.close();
  await redisClient.quit();
});

beforeEach(async () => {
  await cleanup();
});

// ─── REGISTER ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('registra un usuario nuevo correctamente', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: TEST_USER,
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.user.username).toBe(TEST_USER.username);
    expect(body.data.user.phoneVerified).toBe(false);
    expect(body.data.accessToken).toBeDefined();
  });

  it('rechaza username duplicado', async () => {
    // Crear usuario primero
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { ...TEST_USER, phone: '+15551110099', email: 'otro@caprichito.com' },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('USERNAME_ALREADY_EXISTS');
  });

  it('rechaza telefono duplicado', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { ...TEST_USER, username: 'testuser2', email: 'otro@caprichito.com' },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('PHONE_ALREADY_EXISTS');
  });

  it('rechaza email duplicado', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { ...TEST_USER, username: 'testuser3', phone: '+15551110088' },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('EMAIL_ALREADY_EXISTS');
  });
});

// ─── OTP (console.log en modo log) ─────────────────────────────

describe('POST /api/auth/request-otp', () => {
  it('envía OTP y lo guarda en Redis', async () => {
    // Registrar usuario para que exista con teléfono
    const registerRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: TEST_USER,
    });
    const userId = registerRes.json().data.user.id;

    // Limpiar cooldown del registro
    await redisClient.del(`otp:cooldown:${TEST_USER.phone}`);

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/request-otp',
      payload: { phone: TEST_USER.phone },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.expiresIn).toBe(300);

    // Verificar que el OTP se guardó en Redis
    const storedCode = await redisClient.get(`otp:code:${userId}`);
    expect(storedCode).toBeDefined();
    expect(storedCode).toHaveLength(6);
  });

  it('rechaza OTP dentro del cooldown de 60s', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });
    await redisClient.del(`otp:cooldown:${TEST_USER.phone}`);

    // Primer request OK
    await app.inject({
      method: 'POST',
      url: '/api/auth/request-otp',
      payload: { phone: TEST_USER.phone },
    });

    // Segundo request — cooldown activo
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/request-otp',
      payload: { phone: TEST_USER.phone },
    });

    expect(res.statusCode).toBe(429);
    expect(res.json().error).toBe('OTP_COOLDOWN');
  });
});

// ─── CHECK IDENTIFIER ──────────────────────────────────────────

describe('POST /api/auth/check-identifier', () => {
  it('devuelve exists: true para usuario existente', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/check-identifier',
      payload: { identifier: TEST_USER.username },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.exists).toBe(true);
  });

  it('devuelve exists: true buscando por email', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/check-identifier',
      payload: { identifier: TEST_USER.email },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.exists).toBe(true);
  });

  it('devuelve exists: false para usuario inexistente', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/check-identifier',
      payload: { identifier: 'noexisto_jamas' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.exists).toBe(false);
  });
});

// ─── LOGIN ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('login correcto con username y contraseña', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { identifier: TEST_USER.username, password: TEST_USER.password },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.user.username).toBe(TEST_USER.username);
    expect(body.data.accessToken).toBeDefined();

    // Debe setear cookie de refresh token
    const cookies = res.cookies;
    const refreshCookie = cookies.find((c: any) => c.name === 'refresh_token');
    expect(refreshCookie).toBeDefined();
  });

  it('login correcto con email', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { identifier: TEST_USER.email, password: TEST_USER.password },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.user.email).toBe(TEST_USER.email);
  });

  it('login correcto con teléfono', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { identifier: TEST_USER.phone, password: TEST_USER.password },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.user.phone).toBe(TEST_USER.phone);
  });

  it('rechaza contraseña incorrecta', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { identifier: TEST_USER.username, password: 'WrongPass999' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('INVALID_CREDENTIALS');
  });

  it('rechaza usuario inexistente', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { identifier: 'fantasma_total', password: 'NoImporta1' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('INVALID_CREDENTIALS');
  });
});

// ─── REFRESH TOKEN ─────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  it('renueva el access token con refresh cookie válido', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { identifier: TEST_USER.username, password: TEST_USER.password },
    });

    const refreshCookie = loginRes.cookies.find((c: any) => c.name === 'refresh_token');

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      cookies: { refresh_token: refreshCookie!.value },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.accessToken).toBeDefined();

    // Debe setear nueva cookie de refresh
    const newRefreshCookie = res.cookies.find((c: any) => c.name === 'refresh_token');
    expect(newRefreshCookie).toBeDefined();
    expect(newRefreshCookie!.value).not.toBe(refreshCookie!.value);
  });

  it('rechaza sin cookie de refresh', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('MISSING_REFRESH_TOKEN');
  });

  it('rechaza con token inválido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      cookies: { refresh_token: 'token-falso-inventado' },
    });

    expect(res.statusCode).toBe(401);
  });
});

// ─── LOGOUT ────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('cierra sesión y el refresh token deja de funcionar', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: TEST_USER });

    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { identifier: TEST_USER.username, password: TEST_USER.password },
    });

    const refreshCookie = loginRes.cookies.find((c: any) => c.name === 'refresh_token');
    const accessToken = loginRes.json().data.accessToken;

    // Logout
    const logoutRes = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { authorization: `Bearer ${accessToken}` },
      cookies: { refresh_token: refreshCookie!.value },
    });

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.json().success).toBe(true);

    // El refresh token ya no debe funcionar
    const refreshRes = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      cookies: { refresh_token: refreshCookie!.value },
    });

    expect(refreshRes.statusCode).toBe(401);
  });
});

// ─── GOOGLE OAUTH REDIRECT ────────────────────────────────────

describe('GET /api/auth/google', () => {
  it('responde con redirect o stub de Google OAuth', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/google',
    });

    // En test (sin GOOGLE_CLIENT_ID) puede ser 200 stub o 302 redirect
    expect([200, 302]).toContain(res.statusCode);
  });
});
