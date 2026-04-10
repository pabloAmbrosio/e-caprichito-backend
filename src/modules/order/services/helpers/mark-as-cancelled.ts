import type { TxClient } from "../types/tx-client.types";

export async function markAsCancelled(tx: TxClient, orderId: string) {
  return tx.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
    select: { id: true, status: true },
  });
}
