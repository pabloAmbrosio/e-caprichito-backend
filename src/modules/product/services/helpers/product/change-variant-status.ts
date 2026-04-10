import { db } from '../../../../../lib/prisma';
import { ProductNotFoundError } from '../../../errors';

export const changeVariantStatus = async (
  abstractProductId: string,
  variantId: string,
  newStatus: string,
): Promise<void> => {
  const result = await db.product.updateMany({
    where: { id: variantId, abstractProductId, deletedAt: null },
    data: { status: newStatus as any },
  });

  if (result.count === 0) throw new ProductNotFoundError();
};
