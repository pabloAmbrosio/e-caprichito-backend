export const PAYMENT_URL = '/payments';

export const ERROR_MESSAGES = {
  PAYMENT_NOT_FOUND: 'Pago no encontrado',
  PAYMENT_NOT_OWNED: 'Este pago no te pertenece',
  PAYMENT_NOT_PENDING: 'El pago no está en estado pendiente',
  PAYMENT_NOT_AWAITING_REVIEW: 'El pago no está esperando revisión',
  PAYMENT_ALREADY_EXISTS: 'Ya existe un pago activo para esta orden',
  INVALID_PAYMENT_METHOD: 'Método de pago no soportado',

  ORDER_NOT_FOUND: 'Orden no encontrada',
  ORDER_NOT_PENDING: 'La orden no está pendiente de pago',
  ORDER_NOT_OWNED: 'Esta orden no te pertenece',

  INVALID_REVIEW_ACTION: 'Acción de revisión inválida. Usa APPROVE o REJECT',
  INSUFFICIENT_STOCK: 'Stock insuficiente para aprobar el pago',

  INTERNAL_ERROR: 'Error interno del servidor',
} as const;

export const PAYMENT_STATUSES = [
  'PENDING',
  'AWAITING_REVIEW',
  'APPROVED',
  'REJECTED',
  'REFUNDED',
  'EXPIRED',
  'CANCELLED',
] as const;

export const PAYMENT_METHODS = [
  'MANUAL_TRANSFER',
  'CASH_ON_DELIVERY',
] as const;

export const REVIEW_ACTIONS = [
  'APPROVE',
  'REJECT',
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const ALLOWED_PROOF_DOMAINS = [
  'res.cloudinary.com',
  'storage.googleapis.com',
  'firebasestorage.googleapis.com',
  's3.amazonaws.com',
  'imgur.com',
  'i.imgur.com',
] as const;

// Values in centavos (100 = $1 MXN)
export const PAYMENT_AMOUNT_LIMITS = {
  MIN_CENTS: 100,
  MAX_CENTS: 50_000_000,
} as const;

// Allows letters (with accents), numbers, hyphens, spaces, dots
export const BANK_REFERENCE_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-\.]+$/;

// Defense-in-depth: also checked at route level via requireRoles
export const REVIEWER_ALLOWED_ROLES = ['OWNER', 'ADMIN'] as const;

export const PAYMENT_EXPIRATION = {
  PENDING_TTL_MS: 24 * 60 * 60 * 1000,
  CRON_INTERVAL: '*/5 * * * *',
} as const;
