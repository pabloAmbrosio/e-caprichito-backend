import { Prisma } from "../../../../lib/prisma";

export function buildProductFilter(productIds: string[]): Prisma.OrderWhereInput {
  return { items: { some: { productId: { in: productIds } } } };
}
