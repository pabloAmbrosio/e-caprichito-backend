import { OrderStatus } from "../../../../lib/prisma";
import type { TxClient } from "../types/tx-client.types";

export async function logStatusChange(
  tx: TxClient,
  orderId: string,
  changedBy: string,
  previousStatus: OrderStatus,
  newStatus: OrderStatus,
  automatic = false,
) {
  await tx.orderStatusAuditLog.create({
    data: {
      orderId,
      previousStatus,
      newStatus,
      changedBy,
      automatic,
    },
  });
}
