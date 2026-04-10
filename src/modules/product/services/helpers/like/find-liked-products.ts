import { db } from '../../../../../lib/prisma';
import { likedProductSelect } from '../../../product.select';

export const findLikedProducts = async (
  userId: string,
  limit: number,
  offset: number,
) => {
  const where = { userId, abstractProduct: { deletedAt: null, status: 'PUBLISHED' as const } };

  const [rows, total] = await Promise.all([
    db.productLike.findMany({
      where,
      select: likedProductSelect,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.productLike.count({ where }),
  ]);

  return { rows, total };
};

export type RawLikedProduct = Awaited<ReturnType<typeof findLikedProducts>>['rows'][number];
