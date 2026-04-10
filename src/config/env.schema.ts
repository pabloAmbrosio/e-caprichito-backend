/**
 * @file env.schema.ts
 * @description Schema Valibot para todas las variables de entorno del proyecto.
 */

import * as v from "valibot";

import { requiredString, optionalString, optionalInteger } from "./helpers";

// ─── Schema base ──────────────────────────────────────────────────

const BaseEnvSchema = v.object({
  // ── Core ──────────────────────────────────
  NODE_ENV: v.optional(
    v.picklist(["development", "production", "test"]),
    "development"
  ),
  PORT: optionalInteger(3000),

  // ── Database ──────────────────────────────
  DATABASE_URL: requiredString("Cadena de conexión a PostgreSQL"),

  // ── Auth ──────────────────────────────────
  JWT_SECRET: requiredString("Secreto para firmar tokens JWT"),
  COOKIE_SECRET: requiredString("Secreto para firmar cookies"),
  JWT_EXPIRES_IN: optionalString("15m"),
  REFRESH_TOKEN_EXPIRES_IN: optionalString("7d"),
  BCRYPT_SALT_ROUNDS: optionalInteger(10),

  // ── CORS / URLs ───────────────────────────
  FRONTEND_URL: requiredString("URL del frontend para CORS, OAuth, Socket.IO"),
  BASE_URL: v.optional(v.string()),
  ALLOWED_ORIGINS: v.optional(v.string()),

  // ── OAuth Google ──────────────────────────
  GOOGLE_CLIENT_ID: v.optional(v.string()),
  GOOGLE_CLIENT_SECRET: v.optional(v.string()),
  GOOGLE_CALLBACK_URL: optionalString("/api/auth/google/callback"),

  // ── Redis ─────────────────────────────────
  REDIS_URL: v.optional(v.string()),
  REDIS_HOST: optionalString("localhost"),
  REDIS_PORT: optionalInteger(6379),
  REDIS_PASSWORD: v.optional(v.string()),

  // ── Messaging (SMS / WhatsApp) ────────────
  SMS_MODE: v.optional(
    v.picklist(["log", "twilio", "whatsapp"]),
    "log"
  ),
  EMAIL_MODE: v.optional(v.string()),
  TWILIO_ACCOUNT_SID: optionalString(""),
  TWILIO_AUTH_TOKEN: optionalString(""),
  TWILIO_PHONE_NUMBER: optionalString(""),

  // ── Cloudinary ────────────────────────────
  CLOUDINARY_CLOUD_NAME: v.optional(v.string()),
  CLOUDINARY_API_KEY: v.optional(v.string()),
  CLOUDINARY_API_SECRET: v.optional(v.string()),

  // ── Rate Limiting (global) ────────────────
  RATE_LIMIT_MAX: optionalInteger(300),
  RATE_LIMIT_WINDOW: optionalInteger(60_000),

  // ── Rate Limiting (por dominio) ───────────
  AUTH_RATE_LIMIT_MAX: optionalInteger(10),
  AUTH_RATE_LIMIT_WINDOW: optionalInteger(60_000),
  PAYMENT_RATE_LIMIT_MAX: optionalInteger(15),
  PAYMENT_RATE_LIMIT_WINDOW: optionalInteger(60_000),
  READ_RATE_LIMIT_MAX: optionalInteger(120),
  READ_RATE_LIMIT_WINDOW: optionalInteger(60_000),
  INVENTORY_RATE_LIMIT_MAX: optionalInteger(30),
  INVENTORY_RATE_LIMIT_WINDOW: optionalInteger(60_000),
  COUPON_RATE_LIMIT_MAX: optionalInteger(10),
  COUPON_RATE_LIMIT_WINDOW: optionalInteger(60_000),

  // ── Payments ──────────────────────────────
  BANK_NAME: optionalString("BBVA"),
  BANK_ACCOUNT_HOLDER: optionalString("E-Caprichito"),
  BANK_CLABE: optionalString(""),
  BANK_ACCOUNT_NUMBER: optionalString(""),
  PAYMENT_CRON_INTERVAL: optionalString("*/5 * * * *"),

  // ── Promotions ────────────────────────────
  PROMOTION_GRACE_PERIOD_MINUTES: optionalInteger(0),

  // ── Order Expiration ──────────────────────
  ORDER_EXPIRATION_MINUTES: optionalInteger(30),
  ORDER_CRON_INTERVAL: optionalString("*/1 * * * *"),

  // ── Shipment ──────────────────────────────
  STORE_LAT: v.optional(
    v.pipe(v.string(), v.transform(Number)),
    "18.972943"
  ),
  STORE_LNG: v.optional(
    v.pipe(v.string(), v.transform(Number)),
    "-91.178980"
  ),

  // ── Seed ──────────────────────────────────
  SEED_BASE_URL: optionalString("http://localhost:3000"),
});

// ─── Schema final con validaciones condicionales por ambiente ─────

export const EnvSchema = v.pipe(
  BaseEnvSchema,
  v.forward(
    v.check(
      ({ NODE_ENV, GOOGLE_CLIENT_ID }) => NODE_ENV !== 'production' || !!GOOGLE_CLIENT_ID,
      'GOOGLE_CLIENT_ID es obligatorio en producción'
    ),
    ['GOOGLE_CLIENT_ID']
  ),
  v.forward(
    v.check(
      ({ NODE_ENV, GOOGLE_CLIENT_SECRET }) => NODE_ENV !== 'production' || !!GOOGLE_CLIENT_SECRET,
      'GOOGLE_CLIENT_SECRET es obligatorio en producción'
    ),
    ['GOOGLE_CLIENT_SECRET']
  ),
  v.forward(
    v.check(
      ({ NODE_ENV, BASE_URL }) => NODE_ENV !== 'production' || !!BASE_URL,
      'BASE_URL es obligatorio en producción'
    ),
    ['BASE_URL']
  ),
);

// ─── Types ────────────────────────────────────────────────────────

export type EnvSchema = v.InferOutput<typeof EnvSchema>;
