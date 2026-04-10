import { db } from '../../../../../lib/prisma';
import { productLikeResultSelect } from '../../../product.select';

// Idempotent: upsert returns existing if already liked
export const createProductLike = async (
  abstractProductId: string,
  userId: string,
) => {
  return db.productLike.upsert({
    where: { userId_abstractProductId: { userId, abstractProductId } },
    create: { userId, abstractProductId },
    update: {},
    select: productLikeResultSelect,
  });
};
