import { sql, join, empty, Sql } from "../../../../lib/prisma";

// Encuentra la categoría y todos sus descendientes recursivamente
export const buildCategoryDescendantsCte = (categoryIds?: string[]): Sql => {
  
  if (!categoryIds?.length) return empty;
  
  return sql`
    category_descendants AS (
      SELECT id FROM "Category"
      WHERE id IN (${join(categoryIds.map((id) => sql`${id}`), ',')})
      UNION ALL
      SELECT c.id FROM "Category" c
      INNER JOIN category_descendants cd ON c."parentId" = cd.id
    )`;
};
