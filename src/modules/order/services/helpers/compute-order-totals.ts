export function computeOrderTotals(order: {
  items: { quantity: number; product: { priceInCents: number } }[];
  discountTotalInCents: number | null;
  shipment?: { deliveryFee: number } | null;
}) {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.product.priceInCents * item.quantity,
    0,
  );
  const totalDiscount = order.discountTotalInCents ?? 0;
  const deliveryFee = order.shipment?.deliveryFee ?? 0;
  const total = subtotal - totalDiscount + deliveryFee;

  return { subtotal, totalDiscount, deliveryFee, total };
}
