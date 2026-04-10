import { db } from "../../../../lib/prisma";
import { orderPaymentInfoSelect } from "../../order.selects";
import { OrderNotFoundError } from "../../errors/custom/order-not-found.error";
import { BANK_DETAILS } from "../../../payments/payment.config";

export async function getPaymentInfoService(orderId: string, userId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: orderPaymentInfoSelect,
  });

  if (!order || order.customerId !== userId) {
    throw new OrderNotFoundError(orderId);
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.product.priceInCents * item.quantity,
    0,
  );
  const totalDiscount = order.discountTotalInCents ?? 0;
  const deliveryFee = order.shipment?.deliveryFee ?? 0;
  const total = subtotal - totalDiscount + deliveryFee;

  const lastPayment = order.payments[0] ?? null;
  const isCod = lastPayment?.method === 'CASH_ON_DELIVERY';

  return {
    msg: "Información de pago",
    data: {
      orderId: order.id,
      status: order.status,
      deliveryType: order.shipment?.type ?? null,
      subtotal,
      totalDiscount,
      deliveryFee,
      total,
      lastPayment,
      paymentMethod: lastPayment?.method ?? null,
      bankDetails: isCod ? null : BANK_DETAILS,
      concepto: isCod ? null : `Orden ${orderId.slice(0, 8)}`,
    },
  };
}
