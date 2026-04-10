import { db } from "../../../../lib/prisma";
import type { CancelOrderInput, CancelOrderResult, ServiceResult } from "../types";
import { getCustomerOrderOrFail } from "../helpers/get-customer-order-or-fail";
import { assertCancellable } from "../helpers/assert-cancellable";
import { releaseInventory } from "../helpers/release-inventory";
import { markAsCancelled } from "../helpers/mark-as-cancelled";
import { logStatusChange } from "../helpers/log-status-change";

export async function cancelOrderService(
  input: CancelOrderInput,
): Promise<ServiceResult<CancelOrderResult>> {
  const { userId, orderId } = input;

  const data = await db.$transaction(async (tx) => {
    const order = await getCustomerOrderOrFail(tx, userId, orderId);

    assertCancellable(order.status);

    await releaseInventory(tx, order.items);

    await markAsCancelled(tx, orderId);

    await logStatusChange(tx, orderId, userId, order.status, "CANCELLED");

    return {
      orderId: order.id,
      previousStatus: order.status,
      status: "CANCELLED" as const,
    };
  });

  return { msg: "Orden cancelada, stock liberado", data };
}
