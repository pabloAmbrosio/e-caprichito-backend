import { db } from '../../../../../lib/prisma';
import { categorySelect } from '../../../product.select';
import type { UpdateCategoryInput } from '../../../schemas/update-category.schema';

export const updateCategoryRecord = async (
  id: string,
  data: UpdateCategoryInput & { slug?: string },
) => {
  return db.category.update({
    where: { id },
    data,
    select: categorySelect,
  });
};
