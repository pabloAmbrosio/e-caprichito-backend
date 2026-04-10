import { DEFAULT_LIMIT, MAX_LIMIT } from '../constants';

export const clampPagination = (
  limit = DEFAULT_LIMIT,
  offset = 0,
): { safeLimit: number; safeOffset: number } => ({
  safeLimit:  Math.min(Math.max(limit, 1), MAX_LIMIT),
  safeOffset: Math.max(offset, 0),
});
