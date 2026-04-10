import type { OrderStatus, PaymentStatus } from "../../../../lib/prisma";

export interface OrderSummaryMetrics {
  totalOrders: number;
  revenue: number;       // SUM Payment.amount donde status=APPROVED (centavos)
  subtotal: number;      // SUM quantity * priceInCents (centavos)
  totalDiscounts: number;
  totalDeliveryFees: number;
  byOrderStatus: Record<OrderStatus, number>;
  byPaymentStatus: Record<PaymentStatus, number>;
}

export interface OrderSummaryResult {
  allTime: OrderSummaryMetrics;
  today: OrderSummaryMetrics;
  period: OrderSummaryMetrics | null;
}
