import { db } from '../../../../../lib/prisma';

export const checkUserLike = async (
  abstractProductId: string,
  userId?: string,
): Promise<boolean> => {
  if (!userId) return false;

  const like = await db.productLike.findUnique({
    where: {
      userId_abstractProductId: { userId, abstractProductId },
    },
    select: { id: true },
  });

  return like !== null;
};
