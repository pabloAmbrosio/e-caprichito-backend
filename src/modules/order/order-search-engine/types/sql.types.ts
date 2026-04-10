import type { Prisma } from "../../../../lib/prisma";

export interface DataSqlParts {
  searchClause: Prisma.Sql;
  filterClause: Prisma.Sql;
  orderBy: Prisma.Sql;
  pagination: Prisma.Sql;
}
