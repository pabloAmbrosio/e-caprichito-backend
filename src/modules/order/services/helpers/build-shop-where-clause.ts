import { Prisma } from "../../../../lib/prisma";
import type { ListOrdersInput } from "../types/get-my-orders.types";
import { buildStatusFilter } from "./build-status-filter";
import { buildDateRangeFilter } from "./build-date-range-filter";
import { buildProductFilter } from "./build-product-filter";
import { buildProductSearchFilter } from "./build-product-search-filter";

export function buildShopWhereClause(query: ListOrdersInput): Prisma.OrderWhereInput {
  const conditions: Prisma.OrderWhereInput[] = [];

  if (query.status)             conditions.push(buildStatusFilter(query.status));
  if (query.from || query.to)   conditions.push(buildDateRangeFilter(query.from, query.to));
  if (query.productIds?.length) conditions.push(buildProductFilter(query.productIds));
  if (query.search)             conditions.push(buildProductSearchFilter(query.search));

  return {
    customerId: query.userId,
    ...(conditions.length > 0 ? { AND: conditions } : {}),
  };
}
