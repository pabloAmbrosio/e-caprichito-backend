import type { TxClient } from "../types/tx-client.types";
import type { OrderItemQuantity } from "../types/order-item.types";

export async function releaseInventory(
  tx: TxClient,
  items: OrderItemQuantity[],
) {
  await Promise.all(
    items.map(({ productId, quantity }) =>
      tx.inventory.update({
        where: { productId },
        data: { reservedStock: { decrement: quantity } },
      }),
    ),
  );
}
