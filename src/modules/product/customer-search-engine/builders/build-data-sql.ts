import { sql, isNotEmpty, withRecursive, joinAll, type Sql } from '../../../../lib/prisma';
import type { DataSqlParts } from '../types';
import {
  usedCategoriesCte, pathRowsCte, pathAggCte,
  breadcrumbJoin, categoryJoin, variantsJoin, inventoryJoin,
  baseSelect, baseGroupBy,
} from './data-sql-fragments';

// WITH RECURSIVE required because path_rows self-references via UNION ALL
export const buildDataSql = ({
  categoryDescendantsCte,
  salesCte,
  likesCte,
  salesJoin,
  likesJoin,
  isLikedJoin,
  salesSelect,
  likesSelect,
  isLikedSelect,
  salesGroupBy,
  likesGroupBy,
  isLikedGroupBy,
  where,
  orderBy,
  pagination,
}: DataSqlParts): Sql => {

  const ctes = [
    categoryDescendantsCte,
    usedCategoriesCte,
    pathRowsCte,
    pathAggCte,
    salesCte,
    likesCte,
  ].filter(isNotEmpty);

  const joins = [
    breadcrumbJoin,
    categoryJoin,
    variantsJoin,
    inventoryJoin,
    salesJoin,
    likesJoin,
    isLikedJoin,
  ].filter(isNotEmpty);

  const extraSelects = [salesSelect, likesSelect, isLikedSelect].filter(isNotEmpty);
  const extraGroupBys = [salesGroupBy, likesGroupBy, isLikedGroupBy].filter(isNotEmpty);

  return sql`
  ${withRecursive(ctes)}

  SELECT
    ${baseSelect}
    ${joinAll(extraSelects)}

  FROM "AbstractProduct" ap
  ${joinAll(joins)}
  ${where}
  ${baseGroupBy} ${joinAll(extraGroupBys)}
  ${orderBy}
  ${pagination}
`;
};
