import { db } from "../../../../lib/prisma";
import type { FreshProduct } from "../../types/validate-cart.types";

export async function fetchFreshProducts(productIds: string[]): Promise<Map<string, FreshProduct>> {
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, priceInCents: true, deletedAt: true },
  });
  return new Map(products.map((p) => [p.id, p]));
}
