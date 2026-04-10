import { db } from "../../../../lib/prisma";
import { OrderNotFoundError } from "../../errors";
import { orderDetailSelect } from "../../order.selects";
import { computeOrderTotals } from "../helpers/compute-order-totals";

export async function getOrderByIdBackofficeService(orderId: string) {
  const data = await db.order.findUnique({
    where: { id: orderId },
    select: orderDetailSelect,
  });

  if (!data) throw new OrderNotFoundError(orderId);

  return { msg: "Orden encontrada", data: { ...data, ...computeOrderTotals(data) } };
}
