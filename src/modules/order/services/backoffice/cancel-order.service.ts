import { db } from "../../../../lib/prisma";
import { OrderNotFoundError } from "../../errors";
import { orderCancelBackofficeTxSelect } from "../../order.selects";
import { assertCancellableBackoffice } from "../helpers/assert-cancellable-backoffice";
import { releaseInventory } from "../helpers/release-inventory";
import { markAsCancelled } from "../helpers/mark-as-cancelled";
import { logStatusChange } from "../helpers/log-status-change";
import type { CancelOrderBackofficeInput, CancelOrderBackofficeResult } from "../types";

export async function cancelOrderBackofficeService(
  input: CancelOrderBackofficeInput,
): Promise<{ msg: string; data: CancelOrderBackofficeResult; notification: { customerId: string } }> {
  const { orderId, staffId, reason } = input;

  const data = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: orderCancelBackofficeTxSelect,
    });

    if (!order) throw new OrderNotFoundError(orderId);

    assertCancellableBackoffice(order.status);

    // Solo liberar reservedStock si la orden estaba PENDING.
    // Si estaba CONFIRMED (pago aprobado), el stock ya fue deducido
    // de physical y reserved por el review — no hay nada que liberar.
    if (order.status === 'PENDING') {
      await releaseInventory(tx, order.items);
    }

    await markAsCancelled(tx, orderId);

    await logStatusChange(tx, orderId, staffId, order.status, "CANCELLED");

    // ── Fail shipment activo ──
    let shipmentFailed = false;
    if (order.shipment && order.shipment.status !== "FAILED" && order.shipment.status !== "DELIVERED") {
      await tx.shipment.update({
        where: { id: order.shipment.id },
        data: { status: "FAILED" },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: order.shipment.id,
          status: "FAILED",
          note: reason
            ? `Cancelada por admin: ${reason}`
            : "Orden cancelada por administrador",
        },
      });

      shipmentFailed = true;
    }

    // ── Cancel payment PENDING ──
    let paymentCancelled = false;
    const pendingPayments = order.payments.filter((p) => p.status === "PENDING");
    if (pendingPayments.length > 0) {
      await Promise.all(
        pendingPayments.map((p) =>
          tx.payment.update({
            where: { id: p.id },
            data: { status: "CANCELLED" },
          }),
        ),
      );
      paymentCancelled = true;
    }

    // ── Log reason ──
    if (reason) {
      console.log(`[BackofficeCancel] Orden ${orderId} cancelada por staff ${staffId}. Motivo: ${reason}`);
    }

    return {
      orderId: order.id,
      customerId: order.customerId,
      previousStatus: order.status,
      status: "CANCELLED" as const,
      reason,
      shipmentFailed,
      paymentCancelled,
    };
  });

  const { customerId, ...result } = data;

  return {
    msg: "Orden cancelada por administrador",
    data: result,
    notification: { customerId },
  };
}
