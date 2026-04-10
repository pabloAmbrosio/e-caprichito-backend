import { sql, join } from '../../../../lib/prisma';
import type { Sql } from '../../../../lib/prisma';
import type { SortField } from '../types';
import { sortFieldToSql, safeDirection } from './sort-field-to-sql';

export const buildOrderBy = (sort?: SortField[]): Sql => {
  if (!sort?.length) return sql`ORDER BY ap."createdAt" DESC`;

  return sql`ORDER BY ${join(
    sort.map(({ field, direction }) =>
      field === 'random'
        ? sql`RANDOM()`
        : sql`${sortFieldToSql(field)} ${safeDirection(direction)}`
    ),
    ', '
  )}`;
};
