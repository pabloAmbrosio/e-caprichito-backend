import { db } from '../../../../../lib/prisma';
import { ProductNotFoundError } from '../../../errors';

export const softDeleteVariant = async (
  abstractProductId: string,
  variantId: string,
): Promise<void> => {
  const result = await db.product.updateMany({
    where: { id: variantId, abstractProductId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  if (result.count === 0) throw new ProductNotFoundError();
};
