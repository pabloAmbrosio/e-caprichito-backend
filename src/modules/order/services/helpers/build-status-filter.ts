import { Prisma, OrderStatus } from "../../../../lib/prisma";

export function buildStatusFilter(status: OrderStatus): Prisma.OrderWhereInput {
  return { status };
}
