import { Prisma } from "../../../../lib/prisma";
import {
  OrderStatus,
  PaymentStatus,
} from "../../../../lib/prisma";
import { db } from "../../../../lib/prisma";
import type { ServiceResult } from "../types";
import type { OrderSummaryMetrics, OrderSummaryResult } from "../types/order-summary.types";
import type { OrderSummaryInput } from "../../schemas/order-summary.schema";

interface DateRange {
  gte?: Date;
  lte?: Date;
}

const emptyOrderStatusMap = (): Record<OrderStatus, number> =>
  Object.fromEntries(
    Object.values(OrderStatus).map((s) => [s, 0]),
  ) as Record<OrderStatus, number>;

const emptyPaymentStatusMap = (): Record<PaymentStatus, number> =>
  Object.fromEntries(
    Object.values(PaymentStatus).map((s) => [s, 0]),
  ) as Record<PaymentStatus, number>;

function buildSubtotalWhere(range?: DateRange): Prisma.Sql {
  if (!range) return Prisma.empty;

  const conditions: Prisma.Sql[] = [];
  if (range.gte) conditions.push(Prisma.sql`o."createdAt" >= ${range.gte}`);
  if (range.lte) conditions.push(Prisma.sql`o."createdAt" <= ${range.lte}`);

  if (conditions.length === 0) return Prisma.empty;
  if (conditions.length === 1) return Prisma.sql`WHERE ${conditions[0]}`;
  return Prisma.sql`WHERE ${conditions[0]} AND ${conditions[1]}`;
}

// 6 queries Prisma + 1 raw SQL (subtotal) en paralelo
async function buildMetrics(range?: DateRange): Promise<OrderSummaryMetrics> {
  const orderWhere: Prisma.OrderWhereInput = range
    ? { createdAt: range }
    : {};
  const paymentWhere: Prisma.PaymentWhereInput = range
    ? { order: { createdAt: range } }
    : {};
  const shipmentWhere: Prisma.ShipmentWhereInput = range
    ? { order: { createdAt: range } }
    : {};

  const subtotalWhere = buildSubtotalWhere(range);

  const [
    totalOrders,
    ordersByStatus,
    paymentsByStatus,
    revenueAgg,
    discountsAgg,
    deliveryFeesAgg,
    subtotalResult,
  ] = await Promise.all([
    db.order.count({ where: orderWhere }),

    db.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: orderWhere,
    }),

    db.payment.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: paymentWhere,
    }),

    db.payment.aggregate({
      _sum: { amount: true },
      where: { ...paymentWhere, status: "APPROVED" },
    }),

    db.order.aggregate({
      _sum: { discountTotalInCents: true },
      where: orderWhere,
    }),

    db.shipment.aggregate({
      _sum: { deliveryFee: true },
      where: shipmentWhere,
    }),

    db.$queryRaw<[{ subtotal: bigint | null }]>(
      Prisma.sql`
        SELECT COALESCE(SUM(oi.quantity * p."priceInCents"), 0)::bigint AS subtotal
        FROM "OrderItem" oi
        JOIN "Product" p ON p.id = oi."productId"
        JOIN "Order" o ON o.id = oi."orderId"
        ${subtotalWhere}
      `,
    ),
  ]);

  const byOrderStatus = emptyOrderStatusMap();
  for (const row of ordersByStatus) {
    byOrderStatus[row.status] = row._count._all;
  }

  const byPaymentStatus = emptyPaymentStatusMap();
  for (const row of paymentsByStatus) {
    byPaymentStatus[row.status] = row._count._all;
  }

  return {
    totalOrders,
    revenue: revenueAgg._sum.amount ?? 0,
    subtotal: Number(subtotalResult[0]?.subtotal ?? 0n),
    totalDiscounts: discountsAgg._sum.discountTotalInCents ?? 0,
    totalDeliveryFees: deliveryFeesAgg._sum.deliveryFee ?? 0,
    byOrderStatus,
    byPaymentStatus,
  };
}

export async function getOrderSummaryService(
  query: OrderSummaryInput,
): Promise<ServiceResult<OrderSummaryResult>> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayRange: DateRange = { gte: startOfToday };

  const hasPeriod = !!(query.dateFrom || query.dateTo);
  const periodRange: DateRange | undefined = hasPeriod
    ? {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      }
    : undefined;

  const [allTime, today, period] = await Promise.all([
    buildMetrics(),
    buildMetrics(todayRange),
    periodRange ? buildMetrics(periodRange) : Promise.resolve(null),
  ]);

  return {
    msg: "Resumen de ordenes",
    data: { allTime, today, period },
  };
}
