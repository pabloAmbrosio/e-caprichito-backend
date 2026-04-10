import { DEFAULT_LIMIT, MAX_LIMIT } from "../constants";

export const clampPagination = (
  page = 1,
  limit = DEFAULT_LIMIT,
): { safeLimit: number; safeOffset: number } => ({
  safeLimit: Math.min(Math.max(limit, 1), MAX_LIMIT),
  safeOffset: Math.max((page - 1) * Math.min(Math.max(limit, 1), MAX_LIMIT), 0),
});
