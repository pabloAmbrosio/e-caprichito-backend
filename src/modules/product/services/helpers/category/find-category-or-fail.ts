import { db } from '../../../../../lib/prisma';
import { categoryWithChildrenSelect, categoryWithAllChildrenSelect } from '../../../product.select';
import { CategoryNotFoundError } from '../../../errors';

export const findCategoryOrFail = async (id: string, includeInactive = false) => {
  // isActive: undefined bypasses auto-filter (key exists) but Prisma ignores undefined values
  const category = await db.category.findFirst({
    where: { id, ...(includeInactive && { isActive: undefined }) },
    select: includeInactive ? categoryWithAllChildrenSelect : categoryWithChildrenSelect,
  });

  if (!category) throw new CategoryNotFoundError();

  return category;
};
