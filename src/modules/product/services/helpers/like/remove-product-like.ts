import { db } from '../../../../../lib/prisma';

// Idempotent: returns 0 if like doesn't exist
export const removeProductLike = async (
  abstractProductId: string,
  userId: string,
): Promise<number> => {
  const { count } = await db.productLike.deleteMany({
    where: { userId, abstractProductId },
  });
  return count;
};
