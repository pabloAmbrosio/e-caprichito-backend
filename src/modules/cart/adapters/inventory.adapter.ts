import { db } from "../../../lib/prisma";

export async function isInStock(productId: string): Promise<boolean> {
  const inv = await db.inventory.findUnique({
    where: { productId },
    select: { physicalStock: true, reservedStock: true },
  });
  // No inventory record means no stock control — treat as available
  if (!inv) return true;
  return inv.physicalStock - inv.reservedStock > 0;
}