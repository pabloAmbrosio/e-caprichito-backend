import type { Sql } from '../../../../lib/prisma';

export interface AggregatesSqlParts {
  salesCte: Sql;
  likesCte: Sql;
  salesJoin: Sql;
  likesJoin: Sql;
  salesSelect: Sql;
  likesSelect: Sql;
  salesGroupBy: Sql;
  likesGroupBy: Sql;
  isLikedJoin: Sql;
  isLikedSelect: Sql;
  isLikedGroupBy: Sql;
}

export interface DataSqlParts extends AggregatesSqlParts {
  categoryDescendantsCte: Sql;
  where: Sql;
  orderBy: Sql;
  pagination: Sql;
}
