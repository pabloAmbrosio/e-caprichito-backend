import { db } from '../../../../../lib/prisma';
import { Prisma } from '../../../../../lib/prisma';

// Reactivates the category and all its descendants via recursive CTE
export const reactivateCategory = async (id: string) => {
  await db.$executeRaw(Prisma.sql`
    WITH RECURSIVE descendants AS (
      SELECT id FROM "Category" WHERE id = ${id}
      UNION ALL
      SELECT c.id FROM "Category" c
      INNER JOIN descendants d ON c."parentId" = d.id
    )
    UPDATE "Category"
    SET "isActive" = true, "updatedAt" = NOW()
    WHERE id IN (SELECT id FROM descendants)
  `);
};
