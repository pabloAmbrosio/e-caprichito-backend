import { Prisma, PaymentStatus } from "../../../../lib/prisma";

export function buildPaymentStatusFilter(paymentStatus: PaymentStatus): Prisma.OrderWhereInput {
  return { payments: { some: { status: paymentStatus } } };
}
