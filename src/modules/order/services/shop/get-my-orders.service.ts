import { db } from "../../../../lib/prisma";
import type { ListOrdersInput, ListOrdersResult, ServiceResult } from "../types";
import { orderSelect } from "../../order.selects";
import { buildShopWhereClause } from "../helpers/build-shop-where-clause";
import { computeOrderTotals } from "../helpers/compute-order-totals";

export async function listCustomerOrdersService(
  query: ListOrdersInput,
): Promise<ServiceResult<ListOrdersResult>> {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const where = buildShopWhereClause(query);

  const [items, totalItems] = await Promise.all([
    db.order.findMany({
      where,
      select: orderSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  const itemsWithTotals = items.map((order) => ({
    ...order,
    ...computeOrderTotals(order),
  }));

  return {
    msg: "Ordenes obtenidas",
    data: { items: itemsWithTotals, pagination: { page, limit, totalItems, totalPages } },
  };
}
