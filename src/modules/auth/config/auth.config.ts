import { env } from "../../../config/env";

const ALLOWED_REDIRECT_ORIGINS = new Set([
  env.FRONTEND_URL,
]);

export const getSafeRedirectUrl = (url: string): string => {
  return ALLOWED_REDIRECT_ORIGINS.has(url) ? url : env.FRONTEND_URL;
};
