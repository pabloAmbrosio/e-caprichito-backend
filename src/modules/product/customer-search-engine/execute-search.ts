import { STATEMENT_TIMEOUT_MS } from './constants';
import type { ListProductsFilters, PaginatedProducts, AbstractProductRow } from './types';
import { clampPagination } from './helpers/clamp-pagination';
import { buildCategoryDescendantsCte } from './builders/build-category-descendants-cte';
import { buildWhereConditions } from './builders/build-where-conditions';
import { buildOrderBy } from './builders/build-order-by';
import { buildAggregatesSqlParts } from './builders/build-aggregates-sql-parts';
import { buildCountSql } from './builders/build-count-sql';
import { buildDataSql } from './builders/build-data-sql';
import { db, sql, join } from '../../../lib/prisma';

export const executeSearch = async (
  filters: ListProductsFilters = {},
): Promise<PaginatedProducts> => {
  
  const { safeLimit, safeOffset } = clampPagination(filters.limit, filters.offset);

  // needsSales/needsLikes activate on sort OR explicit include flags
  const needsSales =
    (filters.sort?.some((s) => s.field === 'sales') ?? false) ||
    (filters.includeSales ?? false);
  const needsLikes =
    (filters.sort?.some((s) => s.field === 'likes') ?? false) ||
    (filters.includeLikes ?? false);

  const {
    categoryIds, title, tags, isFeatured,
    minPriceInCents, maxPriceInCents, createdFrom, createdTo,
  } = filters;

  const whereFilters = {
    categoryIds, title, tags, isFeatured,
    minPriceInCents, maxPriceInCents, createdFrom, createdTo,
  };

  const conditions             = buildWhereConditions(whereFilters);
  const where                  = sql`WHERE ${join(conditions, ' AND ')}`;
  const categoryDescendantsCte = buildCategoryDescendantsCte(filters.categoryIds);
  const orderBy                = buildOrderBy(filters.sort);
  const pagination             = sql`LIMIT ${safeLimit} OFFSET ${safeOffset}`;

  
  const aggregates             = buildAggregatesSqlParts(needsSales, needsLikes, filters.userId);
  const countSql               = buildCountSql(where, filters.categoryIds);

  const dataSql                = buildDataSql({
    categoryDescendantsCte,
    ...aggregates,
    where,
    orderBy,
    pagination,
  });

  const [countResult, rows] = await db.$transaction(async (tx) => {
    // SET LOCAL scopes timeout to this transaction only; constant value, no user input
    await tx.$executeRawUnsafe(
      `SET LOCAL statement_timeout = ${STATEMENT_TIMEOUT_MS}`,
    );

    if (filters.randomSeed !== undefined) {
      await tx.$executeRaw`SELECT SETSEED(${filters.randomSeed})`;
    }

    const countRows = await tx.$queryRaw<[{ total: bigint }]>(countSql);
    const dataRows  = await tx.$queryRaw<AbstractProductRow[]>(dataSql);

    return [countRows, dataRows] as const;
  });

  const total = Number(countResult[0]?.total ?? 0);
  return { items: rows, total };
};
