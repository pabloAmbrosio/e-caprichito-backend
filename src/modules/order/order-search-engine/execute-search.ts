import { Prisma } from "../../../lib/prisma";
import { db } from "../../../lib/prisma";
import { STATEMENT_TIMEOUT_MS } from "./constants";
import {
  buildSearchConditions,
  buildFilterConditions,
  buildOrderBy,
  buildCountSql,
  buildDataSql,
} from "./builders";
import { sanitizeSearch, clampPagination } from "./helpers";
import type { OrderSearchFilters, OrderSearchRow, PaginatedOrders } from "./types";

// _count_items se mapea a _count.items en el resultado
type RawOrderRow = Omit<OrderSearchRow, "_count"> & { _count_items: number };

export const executeOrderSearch = async (
  filters: OrderSearchFilters,
): Promise<PaginatedOrders> => {
  const rawSearch = filters.search?.trim().slice(0, 255) || undefined;
  const likeSearch = rawSearch ? sanitizeSearch(rawSearch) : undefined;
  const { safeLimit, safeOffset } = clampPagination(filters.page, filters.limit);

  const searchClause = buildSearchConditions(rawSearch, likeSearch);
  const filterConditions = buildFilterConditions(filters);
  const filterClause = filterConditions.length > 0
    ? Prisma.join(filterConditions, " ")
    : Prisma.empty;
  const orderBy = buildOrderBy(filters.sortBy, filters.sortOrder);
  const pagination = Prisma.sql`LIMIT ${safeLimit} OFFSET ${safeOffset}`;

  const parts = { searchClause, filterClause, orderBy, pagination };

  const countSql = buildCountSql(parts);
  const dataSql = buildDataSql(parts);

  const [countResult, rows] = await db.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SET LOCAL statement_timeout = ${STATEMENT_TIMEOUT_MS}`,
    );

    const countRows = await tx.$queryRaw<[{ total: bigint }]>(countSql);
    const dataRows = await tx.$queryRaw<RawOrderRow[]>(dataSql);

    return [countRows, dataRows] as const;
  });

  const total = Number(countResult[0]?.total ?? 0);

  const items: OrderSearchRow[] = rows.map((row) => ({
    id: row.id,
    status: row.status,
    discountTotalInCents: row.discountTotalInCents,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    customer: row.customer,
    items: row.items,
    payments: row.payments,
    shipment: row.shipment,
    _count: { items: row._count_items },
  }));

  return { items, total };
};
