import { sql, join } from "../../../../lib/prisma";
import type { Sql } from "../../../../lib/prisma";

export const buildCountSql = (
  where: Sql,
  categoryIds?: string[],
): Sql => {
  if (categoryIds?.length) {
    return sql`
      WITH RECURSIVE category_descendants AS (
        SELECT id FROM "Category"
        WHERE id IN (${join(categoryIds.map((id) => sql`${id}`), ',')})
        UNION ALL
        SELECT c.id FROM "Category" c
        INNER JOIN category_descendants cd ON c."parentId" = cd.id
      )
      SELECT COUNT(DISTINCT ap.id)::bigint AS total
      FROM "AbstractProduct" ap
      ${where}
    `;
  }
  return sql`
    SELECT COUNT(DISTINCT ap.id)::bigint AS total
    FROM "AbstractProduct" ap
    ${where}
  `;
};
