import { Prisma } from "../../../../lib/prisma";

export function buildAbandonedCartsWhere(inactiveDays: number): Prisma.CartWhereInput {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - inactiveDays);

  return {
    deletedAt: null,
    activeFor: { isNot: null },
    updatedAt: { lt: threshold },
    items:     { some: {} },
  };
}
