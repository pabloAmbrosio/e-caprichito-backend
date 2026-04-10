import { db } from '../../../../../lib/prisma';

export const findLikedProductIds = async (userId: string): Promise<string[]> => {
  const likes = await db.productLike.findMany({
    where: { userId, abstractProduct: { deletedAt: null, status: 'PUBLISHED' } },
    select: { abstractProductId: true },
    orderBy: { createdAt: 'desc' },
  });

  return likes.map((l) => l.abstractProductId);
};
