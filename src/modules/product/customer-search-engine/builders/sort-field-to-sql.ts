import { sql } from '../../../../lib/prisma';
import type { Sql } from '../../../../lib/prisma';
import { InvalidSortFieldError, InvalidSortDirectionError } from '../errors';

const DIR_SQL: Record<string, Sql> = {
  ASC:  sql`ASC`,
  DESC: sql`DESC`,
};

export const sortFieldToSql = (field: string): Sql => {
  switch (field) {
    case 'category':  return sql`cat."name"`;
    case 'title':     return sql`ap.title`;
    case 'createdAt': return sql`ap."createdAt"`;
    case 'random':    return sql`RANDOM()`;
    case 'price':     return sql`MIN(p."priceInCents")`;
    case 'sales':     return sql`COALESCE(sales_agg."totalSales", 0)`;
    case 'likes':     return sql`COALESCE(likes_agg."totalLikes", 0)`;
    default:          throw new InvalidSortFieldError(field);
  }
};

export const safeDirection = (dir: string): Sql => {
  const sql = DIR_SQL[dir.toUpperCase()];
  if (!sql) throw new InvalidSortDirectionError(dir);
  return sql;
};
