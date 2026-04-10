import { env } from './env';

export const AUTH_RATE_LIMIT = {
  max: env.AUTH_RATE_LIMIT_MAX,
  timeWindow: env.AUTH_RATE_LIMIT_WINDOW,
};

export const PAYMENT_RATE_LIMIT = {
  max: env.PAYMENT_RATE_LIMIT_MAX,
  timeWindow: env.PAYMENT_RATE_LIMIT_WINDOW,
};

export const READ_RATE_LIMIT = {
  max: env.READ_RATE_LIMIT_MAX,
  timeWindow: env.READ_RATE_LIMIT_WINDOW,
};
