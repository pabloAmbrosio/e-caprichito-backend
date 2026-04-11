import type { TxClient } from "../types/tx-client.types";
import type { OrderItemQuantity } from "../types/order-item.types";

export async function releaseInventory(
  tx: TxClient,
  items: OrderItemQuantity[],
) {
  for (const { productId, quantity } of items) {
    const inventory = await tx.inventory.findUnique({
      where: { productId },
      select: { reservedStock: true },
    });

    if (!inventory) continue;

    const decrementAmount = Math.min(quantity, inventory.reservedStock);
    if (decrementAmount <= 0) continue;

    await tx.inventory.update({
      where: { productId },
      data: { reservedStock: { decrement: decrementAmount } },
    });
  }
}
