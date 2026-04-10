import { db } from '../../../../../lib/prisma';
import { ProductNotFoundError } from '../../../errors';
import { productExistsSelect } from '../../../product.select';

export const assertProductExists = async (productId: string): Promise<string> => {
  const product = await db.abstractProduct.findUnique({
    where: { id: productId, deletedAt: null, status: 'PUBLISHED' },
    select: productExistsSelect,
  });

  if (!product) throw new ProductNotFoundError();
  return product.id;
};
