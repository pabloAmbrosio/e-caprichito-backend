import { Prisma, OrderStatus } from "../../../../lib/prisma";
import { orderSelect } from "../../order.selects";
import type { PaginationMeta } from "./pagination.types";

export interface ListOrdersInput {
  userId: string;
  page?: number;
  limit?: number;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
  productIds?: string[];
  search?: string;
}

export type CustomerOrder = Prisma.OrderGetPayload<{ select: typeof orderSelect }>;

export interface ListOrdersResult {
  items: CustomerOrder[];
  pagination: PaginationMeta;
}
