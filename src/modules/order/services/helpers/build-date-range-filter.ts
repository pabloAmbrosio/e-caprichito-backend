import { Prisma } from "../../../../lib/prisma";

// Acepta ISO strings o Date
export function buildDateRangeFilter(dateFrom?: string | Date, dateTo?: string | Date): Prisma.OrderWhereInput {
  const createdAt: Prisma.DateTimeFilter = {};
  if (dateFrom) createdAt.gte = typeof dateFrom === "string" ? new Date(dateFrom) : dateFrom;
  if (dateTo) createdAt.lte = typeof dateTo === "string" ? new Date(dateTo) : dateTo;
  return { createdAt };
}
