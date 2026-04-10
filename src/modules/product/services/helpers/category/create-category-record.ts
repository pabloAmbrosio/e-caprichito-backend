import { db } from '../../../../../lib/prisma';
import { categorySelect } from '../../../product.select';

export const createCategoryRecord = async (data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  emoticon?: string;
  parentId?: string;
  sortOrder?: number;
}) => {
  return db.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
      emoticon: data.emoticon,
      parentId: data.parentId,
      sortOrder: data.sortOrder ?? 0,
    },
    select: categorySelect,
  });
};
