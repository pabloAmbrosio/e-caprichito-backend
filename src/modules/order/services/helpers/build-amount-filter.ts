import { Prisma } from "../../../../lib/prisma";

export function buildAmountFilter(min?: number, max?: number): Prisma.OrderWhereInput {
  const discountTotalInCents: Prisma.IntNullableFilter = {};
  if (min !== undefined) discountTotalInCents.gte = min;
  if (max !== undefined) discountTotalInCents.lte = max;
  return { discountTotalInCents };
}
