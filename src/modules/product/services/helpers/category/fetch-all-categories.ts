import { db } from '../../../../../lib/prisma';
import { categorySelect } from '../../../product.select';

export type CategoryFilter = 'all' | 'parents' | 'children';

// filter: 'all' | 'parents' (root only) | 'children' (non-root only)
export const fetchAllCategories = async (onlyActive = true, filter: CategoryFilter = 'all') => {
  const where: Record<string, unknown> = {};

  // isActive: undefined bypasses auto-filter (key exists) but Prisma ignores undefined values
  if (!onlyActive) where.isActive = undefined;
  if (filter === 'parents') where.parentId = null;
  if (filter === 'children') where.parentId = { not: null };

  return db.category.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    select: categorySelect,
    orderBy: { sortOrder: 'asc' },
  });
};
