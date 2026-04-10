import { Prisma } from "../../../../lib/prisma";
import type { DataSqlParts } from "../types";

// COUNT(DISTINCT) evita duplicados causados por los JOINs de items
export const buildCountSql = ({
  searchClause,
  filterClause,
}: Pick<DataSqlParts, "searchClause" | "filterClause">): Prisma.Sql => {
  return Prisma.sql`
    SELECT COUNT(DISTINCT o.id)::bigint AS total
    FROM "Order" o
    JOIN "User" u ON u.id = o."customerId"
    LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
    LEFT JOIN "Product" p ON p.id = oi."productId"
    LEFT JOIN "AbstractProduct" ap ON ap.id = p."abstractProductId"
    LEFT JOIN "Category" c ON c.id = ap."categoryId"
    WHERE 1=1
    ${searchClause}
    ${filterClause}
  `;
};
