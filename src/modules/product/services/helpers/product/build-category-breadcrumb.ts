import { db } from '../../../../../lib/prisma';
import { Prisma } from '../../../../../lib/prisma';
import type { CategoryBreadcrumb } from '../../types/product/product-detail.types';

// Returns [root, ..., parent, category] via recursive CTE
export const buildCategoryBreadcrumb = async (
  categoryId: string,
): Promise<CategoryBreadcrumb[]> => {
  const rows = await db.$queryRaw<CategoryBreadcrumb[]>(Prisma.sql`
    WITH RECURSIVE path AS (
      SELECT id, name, slug, "parentId", 1 AS depth
      FROM "Category"
      WHERE id = ${categoryId}

      UNION ALL

      SELECT c.id, c.name, c.slug, c."parentId", p.depth + 1
      FROM "Category" c
      JOIN path p ON c.id = p."parentId"
    )
    SELECT id, name, slug
    FROM path
    ORDER BY depth DESC
  `);

  return rows;
};
