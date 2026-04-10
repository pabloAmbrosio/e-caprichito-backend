import { db } from "../../../../lib/prisma";
import { orderShopDetailSelect } from "../../order.selects";
import { OrderNotFoundError } from "../../errors/custom/order-not-found.error";
import { computeOrderTotals } from "../helpers/compute-order-totals";

export async function getOrderDetailService(orderId: string, userId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: orderShopDetailSelect,
  });

  if (!order || order.customerId !== userId) {
    throw new OrderNotFoundError(orderId);
  }

  return {
    msg: "Detalle de orden",
    data: {
      ...order,
      ...computeOrderTotals(order),
    },
  };
}
