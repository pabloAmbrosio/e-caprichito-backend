import { db } from '../../../../../lib/prisma';
import { ProductNotFoundError } from '../../../errors';
import { backofficeProductDetailSelect } from '../../../product.select';

export const findProductBackofficeOrFail = async (id: string) => {
  const product = await db.abstractProduct.findUnique({
    where: { id, deletedAt: null },
    select: backofficeProductDetailSelect,
  });

  if (!product) throw new ProductNotFoundError();

  return product;
};

export type RawBackofficeProduct = NonNullable<
  Awaited<ReturnType<typeof findProductBackofficeOrFail>>
>;
