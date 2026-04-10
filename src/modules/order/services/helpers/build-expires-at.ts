export function buildExpiresAt(minutes?: number): Date | null {
  if (!minutes) return null;
  return new Date(Date.now() + minutes * 60 * 1000);
}
