import { Prisma } from "../../../../lib/prisma";

export function buildCustomerFilter(customerIds: string[]): Prisma.OrderWhereInput {
  return { customerId: { in: customerIds } };
}
