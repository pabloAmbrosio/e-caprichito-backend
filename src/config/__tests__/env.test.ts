import { describe, it, expect, beforeEach } from "vitest";
import * as v from "valibot";
import { EnvSchema } from "../env.schema";

/**
 * Env mínimo válido — las 4 variables required del schema.
 */
const validEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  JWT_SECRET: "secret",
  COOKIE_SECRET: "cookie-secret",
  FRONTEND_URL: "http://localhost:5173",
};

describe("EnvSchema", () => {
  // ── Required vars ───────────────────────────────────

  it("pasa con las variables requeridas", () => {
    const result = v.safeParse(EnvSchema, validEnv);
    expect(result.success).toBe(true);
  });

  it.each(["DATABASE_URL", "JWT_SECRET", "COOKIE_SECRET", "FRONTEND_URL"])(
    "falla si falta %s",
    (key) => {
      const env = { ...validEnv, [key]: undefined };
      const result = v.safeParse(EnvSchema, env);
      expect(result.success).toBe(false);
    }
  );

  it("falla si una variable requerida es string vacío", () => {
    const env = { ...validEnv, JWT_SECRET: "" };
    const result = v.safeParse(EnvSchema, env);
    expect(result.success).toBe(false);
  });

  // ── Defaults ────────────────────────────────────────

  it("aplica defaults cuando no se proveen opcionales", () => {
    const result = v.safeParse(EnvSchema, validEnv);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.output.NODE_ENV).toBe("development");
    expect(result.output.PORT).toBe(3000);
    expect(result.output.JWT_EXPIRES_IN).toBe("15m");
    expect(result.output.SMS_MODE).toBe("log");
    expect(result.output.REDIS_HOST).toBe("localhost");
    expect(result.output.REDIS_PORT).toBe(6379);
    expect(result.output.RATE_LIMIT_MAX).toBe(300);
  });

  // ── Coerción de tipos ───────────────────────────────

  it("coerce PORT de string a number", () => {
    const env = { ...validEnv, PORT: "4000" };
    const result = v.safeParse(EnvSchema, env);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.output.PORT).toBe(4000);
    expect(typeof result.output.PORT).toBe("number");
  });

  it("coerce STORE_LAT y STORE_LNG a number", () => {
    const env = { ...validEnv, STORE_LAT: "19.4326", STORE_LNG: "-99.1332" };
    const result = v.safeParse(EnvSchema, env);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.output.STORE_LAT).toBeCloseTo(19.4326);
    expect(result.output.STORE_LNG).toBeCloseTo(-99.1332);
  });

  // ── Picklist validation ─────────────────────────────

  it("acepta valores válidos de NODE_ENV", () => {
    for (const val of ["development", "production", "test"]) {
      const env = { ...validEnv, NODE_ENV: val };
      // production requiere Google OAuth credentials
      if (val === "production") {
        Object.assign(env, { GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secret" });
      }
      const result = v.safeParse(EnvSchema, env);
      expect(result.success).toBe(true);
    }
  });

  it("rechaza NODE_ENV inválido", () => {
    const result = v.safeParse(EnvSchema, { ...validEnv, NODE_ENV: "staging" });
    expect(result.success).toBe(false);
  });

  it("acepta valores válidos de SMS_MODE", () => {
    for (const val of ["log", "twilio", "whatsapp"]) {
      const result = v.safeParse(EnvSchema, { ...validEnv, SMS_MODE: val });
      expect(result.success).toBe(true);
    }
  });

  it("rechaza SMS_MODE inválido", () => {
    const result = v.safeParse(EnvSchema, { ...validEnv, SMS_MODE: "sendgrid" });
    expect(result.success).toBe(false);
  });

  // ── Forward: required in production ────────────────

  it("falla en production si falta GOOGLE_CLIENT_ID", () => {
    const env = { ...validEnv, NODE_ENV: "production", GOOGLE_CLIENT_SECRET: "secret" };
    const result = v.safeParse(EnvSchema, env);
    expect(result.success).toBe(false);
  });

  it("falla en production si falta GOOGLE_CLIENT_SECRET", () => {
    const env = { ...validEnv, NODE_ENV: "production", GOOGLE_CLIENT_ID: "id" };
    const result = v.safeParse(EnvSchema, env);
    expect(result.success).toBe(false);
  });

  it("pasa en production con ambas credenciales Google", () => {
    const env = {
      ...validEnv,
      NODE_ENV: "production",
      GOOGLE_CLIENT_ID: "id",
      GOOGLE_CLIENT_SECRET: "secret",
    };
    const result = v.safeParse(EnvSchema, env);
    expect(result.success).toBe(true);
  });

  it("pasa en development sin credenciales Google", () => {
    const result = v.safeParse(EnvSchema, { ...validEnv, NODE_ENV: "development" });
    expect(result.success).toBe(true);
  });
});
