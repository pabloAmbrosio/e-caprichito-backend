import type { TxClient } from "../types/tx-client.types";
import { OrderNotFoundError } from "../../errors";
import { orderOwnershipTxSelect } from "../../order.selects";

export async function getCustomerOrderOrFail(
  tx: TxClient,
  userId: string,
  orderId: string,
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: orderOwnershipTxSelect,
  });

  if (!order || order.customerId !== userId) {
    throw new OrderNotFoundError(orderId);
  }

  return order;
}
