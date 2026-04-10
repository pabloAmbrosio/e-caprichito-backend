import { describe, it, expect } from 'vitest';
import { generateOTP } from '../services/otp/generate-otp';
import { mapUserToPayload } from '../services/token/map-user-to-payload';
import { hashPassword, comparePassword } from '../../../lib/bcrypt';

// ─── generateOTP ───────────────────────────────────────────────

describe('generateOTP', () => {
  it('genera string de 6 dígitos', () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('genera valores diferentes en llamadas consecutivas', () => {
    const otps = new Set(Array.from({ length: 20 }, () => generateOTP()));
    // Con 20 intentos debería haber al menos 2 distintos
    expect(otps.size).toBeGreaterThan(1);
  });

  it('no genera strings vacíos', () => {
    for (let i = 0; i < 50; i++) {
      const otp = generateOTP();
      expect(otp.length).toBe(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─── mapUserToPayload ──────────────────────────────────────────

describe('mapUserToPayload', () => {
  const validUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'test@test.com',
    phone: '+15551234567',
    adminRole: 'CUSTOMER',
    customerRole: 'MEMBER',
    phoneVerified: true,
  };

  it('mapea todos los campos correctamente', () => {
    const payload = mapUserToPayload(validUser as any);
    expect(payload.userId).toBe(validUser.id);
    expect(payload.username).toBe(validUser.username);
    expect(payload.email).toBe(validUser.email);
    expect(payload.phone).toBe(validUser.phone);
    expect(payload.adminRole).toBe(validUser.adminRole);
    expect(payload.customerRole).toBe(validUser.customerRole);
    expect(payload.phoneVerified).toBe(true);
  });

  it('maneja campos null (email, phone, customerRole)', () => {
    const user = { ...validUser, email: null, phone: null, customerRole: null };
    const payload = mapUserToPayload(user as any);
    expect(payload.email).toBeNull();
    expect(payload.phone).toBeNull();
    expect(payload.customerRole).toBeNull();
  });

  it('lanza error si falta id o username', () => {
    expect(() => mapUserToPayload({} as any)).toThrow();
    expect(() => mapUserToPayload({ id: '123' } as any)).toThrow();
  });
});

// ─── bcrypt helpers ────────────────────────────────────────────

describe('hashPassword / comparePassword', () => {
  it('hashea y verifica correctamente', async () => {
    const hash = await hashPassword('MiPassword123');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('MiPassword123');
    expect(hash.length).toBeGreaterThan(20);

    const isValid = await comparePassword('MiPassword123', hash);
    expect(isValid).toBe(true);
  });

  it('rechaza contraseña incorrecta', async () => {
    const hash = await hashPassword('CorrectPassword');
    const isValid = await comparePassword('WrongPassword', hash);
    expect(isValid).toBe(false);
  });

  it('cada hash es diferente (salt)', async () => {
    const hash1 = await hashPassword('SamePassword');
    const hash2 = await hashPassword('SamePassword');
    expect(hash1).not.toBe(hash2);
  });
});
