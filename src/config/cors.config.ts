import { env } from './env';

export function getAllowedOrigins(): string[] {
  const origins: string[] = [env.FRONTEND_URL];

  if (env.ALLOWED_ORIGINS) {
    origins.push(
      ...env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    );
  }

  return origins;
}
