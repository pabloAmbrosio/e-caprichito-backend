import { db } from "../../../../lib/prisma";
import type { ListOrdersBackofficeInput, ListOrdersBackofficeResult, ServiceResult } from "../types";
import { orderBackofficeSelect } from "../../order.selects";
import { buildBackofficeWhereClause } from "../helpers/build-backoffice-where-clause";
import { executeOrderSearch } from "../../order-search-engine";
import { computeOrderTotals } from "../helpers/compute-order-totals";

// Sin search → Prisma ORM; con search → SQL raw + pg_trgm
export async function listOrdersBackofficeService(
  query: ListOrdersBackofficeInput,
): Promise<ServiceResult<ListOrdersBackofficeResult>> {
  const { page = 1, limit = 20 } = query;

  if (query.search?.trim()) {
    const result = await executeOrderSearch({
      search: query.search,
      status: query.status,
      paymentStatus: query.paymentStatus,
      shipmentStatus: query.shipmentStatus,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      page,
      limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    const totalPages = Math.ceil(result.total / limit);

    const itemsWithTotals = result.items.map((order) => ({
      ...order,
      ...computeOrderTotals(order),
    }));

    return {
      msg: "Ordenes listadas",
      data: {
        items: itemsWithTotals,
        pagination: { page, limit, totalItems: result.total, totalPages },
      },
    };
  }

  const skip = (page - 1) * limit;
  const where = buildBackofficeWhereClause(query);

  const orderBy = {
    [query.sortBy ?? "createdAt"]: query.sortOrder ?? "desc",
  };

  const [items, totalItems] = await Promise.all([
    db.order.findMany({
      where,
      select: orderBackofficeSelect,
      orderBy,
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
    msg: "Ordenes listadas",
    data: { items: itemsWithTotals, pagination: { page, limit, totalItems, totalPages } },
  };
}
